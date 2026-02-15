from __future__ import annotations

from collections import defaultdict
from typing import Any

import numpy as np
import pandas as pd

MONTHLY_CHARGES_HIGH_THRESHOLD = 70.0
MEDIUM_RISK_THRESHOLD = 0.40
HIGH_RISK_THRESHOLD = 0.70
_BATCH_SHAP_MAX_ROWS = 300
_BATCH_SHAP_BACKGROUND_ROWS = 80


class ShapDependencyError(RuntimeError):
    """Raised when SHAP is not available in the environment."""


class ShapComputationError(RuntimeError):
    """Raised when SHAP explanation cannot be computed."""


def get_risk_level(probability: float) -> str:
    if probability < 0.40:
        return "LOW"
    if probability < 0.70:
        return "MEDIUM"
    return "HIGH"


def get_global_risk_level(high_risk_rate: float) -> str:
    if high_risk_rate >= 0.30:
        return "ÉLEVÉ"
    if high_risk_rate >= 0.10:
        return "MOYEN"
    return "FAIBLE"


def build_recommendations(client_features: dict[str, Any]) -> list[str]:
    recommendations: list[str] = []

    def add_unique(message: str) -> None:
        if message not in recommendations:
            recommendations.append(message)

    contract_value = str(client_features.get("Contract", "")).strip().lower()
    payment_method_value = str(client_features.get("PaymentMethod", "")).strip().lower()

    try:
        tenure_value = float(client_features.get("Tenure", 0))
    except (TypeError, ValueError):
        tenure_value = 0.0

    try:
        monthly_charges_value = float(client_features.get("MonthlyCharges", 0))
    except (TypeError, ValueError):
        monthly_charges_value = 0.0

    if contract_value == "month-to-month":
        add_unique("Proposer une offre avec engagement 12 ou 24 mois incluant une remise.")
    if tenure_value < 12:
        add_unique("Mettre en place une stratégie de fidélisation personnalisée.")
    if payment_method_value == "electronic check":
        add_unique("Encourager l'adoption de moyens de paiement automatiques (prélèvement, carte bancaire).")
    if monthly_charges_value >= MONTHLY_CHARGES_HIGH_THRESHOLD:
        add_unique("Réévaluer la politique tarifaire et proposer une offre groupée adaptée.")

    if not recommendations:
        add_unique("Maintenir un suivi proactif de la rétention avec des actions personnalisées.")

    return recommendations


def build_batch_consulting_insights(
    model,
    features_df: pd.DataFrame,
    probabilities: np.ndarray,
    required_features: list[str],
) -> dict[str, Any]:
    probs = np.asarray(probabilities, dtype=float)
    n_rows = int(len(probs))
    if n_rows == 0:
        return {
            "n_rows": 0,
            "probability_mean": 0.0,
            "high_risk_count": 0,
            "high_risk_rate": 0.0,
            "risk_level_global": "FAIBLE",
            "segments": {
                "high": {"count": 0, "rate": 0.0},
                "medium": {"count": 0, "rate": 0.0},
                "low": {"count": 0, "rate": 0.0},
            },
            "global_top_drivers": [],
            "recommendations": [],
        }

    high_mask = probs >= HIGH_RISK_THRESHOLD
    medium_mask = (probs >= MEDIUM_RISK_THRESHOLD) & (probs < HIGH_RISK_THRESHOLD)
    low_mask = probs < MEDIUM_RISK_THRESHOLD

    high_count = int(high_mask.sum())
    high_rate = float(high_mask.mean())

    segments = {
        "high": {"count": high_count, "rate": high_rate},
        "medium": {"count": int(medium_mask.sum()), "rate": float(medium_mask.mean())},
        "low": {"count": int(low_mask.sum()), "rate": float(low_mask.mean())},
    }

    global_top_drivers = _build_global_top_drivers(
        model=model,
        features_df=features_df,
        probabilities=probs,
        required_features=required_features,
    )

    return {
        "n_rows": n_rows,
        "probability_mean": float(probs.mean()),
        "high_risk_count": high_count,
        "high_risk_rate": high_rate,
        "risk_level_global": get_global_risk_level(high_rate),
        "segments": segments,
        "global_top_drivers": global_top_drivers,
        "recommendations": _build_global_recommendations(features_df, probs),
    }


def explain_client_prediction(
    model,
    client_features: dict[str, Any],
    required_features: list[str],
) -> dict[str, Any]:
    client_df = pd.DataFrame([client_features], columns=required_features)
    probability = float(model.predict_proba(client_df)[0, 1])

    if not hasattr(model, "named_steps"):
        raise ShapComputationError("Loaded model is not a supported sklearn pipeline.")

    preprocessor = model.named_steps.get("preprocessor")
    classifier = model.named_steps.get("classifier")
    if preprocessor is None or classifier is None:
        raise ShapComputationError("Pipeline must expose 'preprocessor' and 'classifier' steps.")

    transformed_client = preprocessor.transform(client_df)
    transformed_client_array = _to_dense_array(transformed_client)

    try:
        transformed_feature_names = list(preprocessor.get_feature_names_out(required_features))
    except Exception:
        transformed_feature_names = [f"feature_{idx}" for idx in range(transformed_client_array.shape[1])]

    background_df = _build_background_df(client_features, required_features)
    transformed_background = preprocessor.transform(background_df)
    transformed_background_array = _to_dense_array(transformed_background)

    shap = _import_shap()
    shap_output = _compute_shap_output(
        shap=shap,
        classifier=classifier,
        transformed_client=transformed_client_array,
        transformed_background=transformed_background_array,
        transformed_feature_names=transformed_feature_names,
    )

    shap_row_values = _extract_positive_class_shap_values(shap_output)
    aggregated_impacts = _aggregate_impacts_by_business_feature(
        shap_values=shap_row_values,
        transformed_feature_names=transformed_feature_names,
        required_features=required_features,
    )

    top_drivers = []
    for feature_name, shap_value in sorted(aggregated_impacts.items(), key=lambda x: abs(x[1]), reverse=True)[:3]:
        direction = "increases" if shap_value >= 0 else "decreases"
        top_drivers.append(
            {
                "feature": feature_name,
                "direction": direction,
                "shap_value": round(float(shap_value), 4),
                "human_explanation": _human_explanation(feature_name, direction, client_features),
            }
        )

    return {
        "probability": round(probability, 4),
        "churn": bool(probability >= 0.5),
        "risk_level": get_risk_level(probability),
        "top_drivers": top_drivers,
        "recommendations": build_recommendations(client_features),
    }


def _build_global_top_drivers(
    model,
    features_df: pd.DataFrame,
    probabilities: np.ndarray,
    required_features: list[str],
) -> list[dict[str, Any]]:
    shap_drivers = _compute_batch_shap_drivers(
        model=model,
        features_df=features_df,
        required_features=required_features,
    )
    if shap_drivers:
        return shap_drivers
    return _compute_batch_heuristic_drivers(features_df, probabilities)


def _compute_batch_shap_drivers(
    model,
    features_df: pd.DataFrame,
    required_features: list[str],
) -> list[dict[str, Any]]:
    if not hasattr(model, "named_steps"):
        return []

    preprocessor = model.named_steps.get("preprocessor")
    classifier = model.named_steps.get("classifier")
    if preprocessor is None or classifier is None:
        return []

    sample_df = features_df
    if len(features_df) > _BATCH_SHAP_MAX_ROWS:
        sample_df = features_df.sample(n=_BATCH_SHAP_MAX_ROWS, random_state=42)

    transformed_sample = _to_dense_array(preprocessor.transform(sample_df))
    if transformed_sample.size == 0:
        return []

    try:
        transformed_feature_names = list(preprocessor.get_feature_names_out(required_features))
    except Exception:
        transformed_feature_names = [f"feature_{idx}" for idx in range(transformed_sample.shape[1])]

    try:
        shap = _import_shap()
        if _is_tree_model(classifier):
            explainer = shap.TreeExplainer(classifier, feature_names=transformed_feature_names)
            shap_output = explainer(transformed_sample)
        else:
            background_rows = min(_BATCH_SHAP_BACKGROUND_ROWS, transformed_sample.shape[0])
            background = transformed_sample[:background_rows]
            explainer = shap.Explainer(
                classifier.predict_proba,
                background,
                feature_names=transformed_feature_names,
            )
            shap_output = explainer(transformed_sample)
    except Exception:
        return []

    shap_matrix = _extract_positive_class_shap_matrix(shap_output)
    if shap_matrix.size == 0:
        return []

    mean_abs_values = np.mean(np.abs(shap_matrix), axis=0)
    aggregated: dict[str, float] = defaultdict(float)
    for transformed_feature, mean_abs in zip(transformed_feature_names, mean_abs_values):
        business_feature = _extract_business_feature_name(transformed_feature, required_features)
        aggregated[business_feature] += float(mean_abs)

    return _format_global_drivers(aggregated, limit=5)


def _compute_batch_heuristic_drivers(
    features_df: pd.DataFrame,
    probabilities: np.ndarray,
) -> list[dict[str, Any]]:
    if features_df.empty:
        return []

    high_risk_df = features_df.loc[probabilities >= HIGH_RISK_THRESHOLD]
    analysis_df = high_risk_df if not high_risk_df.empty else features_df
    n_rows = max(1, len(analysis_df))

    contract_series = analysis_df["Contract"].astype(str).str.lower()
    payment_series = analysis_df["PaymentMethod"].astype(str).str.lower()
    tenure_series = pd.to_numeric(analysis_df["Tenure"], errors="coerce").fillna(0.0)
    monthly_series = pd.to_numeric(analysis_df["MonthlyCharges"], errors="coerce").fillna(0.0)

    scores = {
        "Contract": float((contract_series == "month-to-month").sum()) / n_rows,
        "Tenure": float((tenure_series < 12).sum()) / n_rows,
        "MonthlyCharges": float((monthly_series >= MONTHLY_CHARGES_HIGH_THRESHOLD).sum()) / n_rows,
        "PaymentMethod": float((payment_series == "electronic check").sum()) / n_rows,
        "TotalCharges": float((pd.to_numeric(analysis_df["TotalCharges"], errors="coerce").fillna(0.0) < 1000).sum())
        / n_rows,
    }

    if max(scores.values(), default=0.0) <= 0.0:
        scores = {
            "Contract": 0.25,
            "Tenure": 0.2,
            "MonthlyCharges": 0.2,
            "PaymentMethod": 0.2,
            "TotalCharges": 0.15,
        }

    return _format_global_drivers(scores, limit=5)


def _format_global_drivers(importance_by_feature: dict[str, float], limit: int) -> list[dict[str, Any]]:
    sorted_items = sorted(importance_by_feature.items(), key=lambda item: item[1], reverse=True)[:limit]
    if not sorted_items:
        return []

    max_importance = max(value for _, value in sorted_items)
    if max_importance <= 0:
        max_importance = 1.0

    return [
        {
            "feature": feature,
            "importance": round(float(value / max_importance), 4),
            "interpretation": _driver_interpretation(feature),
        }
        for feature, value in sorted_items
    ]


def _build_global_recommendations(features_df: pd.DataFrame, probabilities: np.ndarray) -> list[str]:
    recommendations: list[str] = []

    def add_unique(message: str) -> None:
        if message not in recommendations:
            recommendations.append(message)

    add_unique("Prioriser les clients à risque élevé avec une offre de rétention immédiate")

    high_risk_df = features_df.loc[probabilities >= HIGH_RISK_THRESHOLD]
    analysis_df = high_risk_df if not high_risk_df.empty else features_df
    n_rows = max(1, len(analysis_df))

    contract_ratio = (
        float((analysis_df["Contract"].astype(str).str.lower() == "month-to-month").sum()) / n_rows
    )
    tenure_ratio = float((pd.to_numeric(analysis_df["Tenure"], errors="coerce").fillna(0.0) < 12).sum()) / n_rows
    payment_ratio = (
        float((analysis_df["PaymentMethod"].astype(str).str.lower() == "electronic check").sum()) / n_rows
    )
    pricing_ratio = (
        float((pd.to_numeric(analysis_df["MonthlyCharges"], errors="coerce").fillna(0.0) >= MONTHLY_CHARGES_HIGH_THRESHOLD).sum())
        / n_rows
    )

    if contract_ratio >= 0.10:
        add_unique("Proposer un engagement 12/24 mois avec remise pour réduire le churn des contrats mensuels")
    if tenure_ratio >= 0.10:
        add_unique("Mettre en place une stratégie de fidélisation pour les clients récents (< 12 mois)")
    if payment_ratio >= 0.10:
        add_unique("Encourager les moyens de paiement automatiques (prélèvement/carte) via une incitation")
    if pricing_ratio >= 0.10:
        add_unique("Proposer une offre groupée ou ajustement tarifaire pour réduire la sensibilité au prix")

    if len(recommendations) == 1:
        add_unique("Maintenir un pilotage proactif des segments clients et suivre les signaux de résiliation.")

    return recommendations


def _driver_interpretation(feature: str) -> str:
    mapping = {
        "Contract": "Les contrats mensuels augmentent fortement le risque de résiliation",
        "Tenure": "Une ancienneté faible reflète une fidélité limitée et un risque accru",
        "MonthlyCharges": "Des frais mensuels élevés traduisent une sensibilité importante au prix",
        "PaymentMethod": "Le paiement par chèque électronique est associé à un risque de résiliation plus élevé",
        "TotalCharges": "Le niveau des dépenses cumulées influence la stabilité de la relation client",
        "Age": "Le profil d'âge contribue à la variabilité du risque selon les segments clients",
        "Gender": "Le segment de genre présente une influence secondaire sur le risque observé",
    }
    return mapping.get(feature, f"Le facteur {feature} présente une contribution notable au risque de résiliation")


def _import_shap():
    try:
        import shap  # type: ignore
    except ImportError as exc:
        raise ShapDependencyError(
            "SHAP is required for /explain. Install it with: pip install shap"
        ) from exc
    return shap


def _to_dense_array(values) -> np.ndarray:
    if hasattr(values, "toarray"):
        return values.toarray()
    return np.asarray(values)


def _build_background_df(client_features: dict[str, Any], required_features: list[str]) -> pd.DataFrame:
    age = float(client_features.get("Age", 45))
    tenure = float(client_features.get("Tenure", 12))
    monthly = float(client_features.get("MonthlyCharges", 70))
    total = float(client_features.get("TotalCharges", 840))

    rows = [
        {
            "Age": 30,
            "Gender": "Female",
            "Tenure": 3,
            "MonthlyCharges": 85.0,
            "Contract": "Month-to-month",
            "PaymentMethod": "Electronic check",
            "TotalCharges": 255.0,
        },
        {
            "Age": 42,
            "Gender": "Male",
            "Tenure": 18,
            "MonthlyCharges": 65.0,
            "Contract": "One year",
            "PaymentMethod": "Bank transfer",
            "TotalCharges": 1170.0,
        },
        {
            "Age": 57,
            "Gender": "Female",
            "Tenure": 48,
            "MonthlyCharges": 55.0,
            "Contract": "Two year",
            "PaymentMethod": "Credit card",
            "TotalCharges": 2640.0,
        },
        {
            "Age": max(18.0, age - 12.0),
            "Gender": "Male",
            "Tenure": max(0.0, tenure - 8.0),
            "MonthlyCharges": max(10.0, monthly - 20.0),
            "Contract": "Month-to-month",
            "PaymentMethod": "Mailed check",
            "TotalCharges": max(0.0, total - 300.0),
        },
        {
            "Age": min(90.0, age + 8.0),
            "Gender": "Female",
            "Tenure": tenure + 12.0,
            "MonthlyCharges": monthly + 15.0,
            "Contract": "One year",
            "PaymentMethod": "Bank transfer",
            "TotalCharges": total + 400.0,
        },
    ]

    return pd.DataFrame(rows)[required_features]


def _is_tree_model(classifier) -> bool:
    class_name = classifier.__class__.__name__.lower()
    return any(token in class_name for token in ("tree", "forest", "xgb", "lgbm", "catboost"))


def _compute_shap_output(
    shap,
    classifier,
    transformed_client: np.ndarray,
    transformed_background: np.ndarray,
    transformed_feature_names: list[str],
):
    try:
        if _is_tree_model(classifier):
            explainer = shap.TreeExplainer(classifier, feature_names=transformed_feature_names)
            return explainer(transformed_client)

        explainer = shap.Explainer(
            classifier.predict_proba,
            transformed_background,
            feature_names=transformed_feature_names,
        )
        return explainer(transformed_client)
    except Exception as exc:
        raise ShapComputationError(
            "Unable to compute SHAP values. Ensure shap is installed and compatible."
        ) from exc


def _extract_positive_class_shap_matrix(shap_output) -> np.ndarray:
    values = getattr(shap_output, "values", shap_output)

    if isinstance(values, list):
        if not values:
            return np.empty((0, 0), dtype=float)
        class_values = np.asarray(values[1] if len(values) > 1 else values[0], dtype=float)
        if class_values.ndim == 1:
            return class_values.reshape(1, -1)
        return class_values

    array_values = np.asarray(values, dtype=float)
    if array_values.ndim == 3:
        class_index = 1 if array_values.shape[2] > 1 else 0
        return np.asarray(array_values[:, :, class_index], dtype=float)
    if array_values.ndim == 2:
        return np.asarray(array_values, dtype=float)
    if array_values.ndim == 1:
        return np.asarray(array_values, dtype=float).reshape(1, -1)
    return np.empty((0, 0), dtype=float)


def _extract_positive_class_shap_values(shap_output) -> np.ndarray:
    shap_matrix = _extract_positive_class_shap_matrix(shap_output)
    if shap_matrix.size == 0:
        return np.array([], dtype=float)
    return np.asarray(shap_matrix[0], dtype=float)


def _aggregate_impacts_by_business_feature(
    shap_values: np.ndarray,
    transformed_feature_names: list[str],
    required_features: list[str],
) -> dict[str, float]:
    impacts: dict[str, float] = {feature: 0.0 for feature in required_features}

    for transformed_feature, shap_value in zip(transformed_feature_names, shap_values):
        business_feature = _extract_business_feature_name(transformed_feature, required_features)
        impacts[business_feature] = impacts.get(business_feature, 0.0) + float(shap_value)

    return impacts


def _extract_business_feature_name(transformed_feature: str, required_features: list[str]) -> str:
    feature_name = transformed_feature
    if "__" in feature_name:
        feature_name = feature_name.split("__", 1)[1]

    for required_feature in required_features:
        if feature_name == required_feature or feature_name.startswith(f"{required_feature}_"):
            return required_feature

    return feature_name.split("_", 1)[0]


def _human_explanation(feature: str, direction: str, client_features: dict[str, Any]) -> str:
    contract_value = str(client_features.get("Contract", "")).strip().lower()
    payment_method_value = str(client_features.get("PaymentMethod", "")).strip().lower()

    try:
        tenure_value = float(client_features.get("Tenure", 0))
    except (TypeError, ValueError):
        tenure_value = 0.0

    try:
        monthly_charges_value = float(client_features.get("MonthlyCharges", 0))
    except (TypeError, ValueError):
        monthly_charges_value = 0.0

    if feature == "Contract":
        if contract_value == "month-to-month" and direction == "increases":
            return "Un contrat mensuel (sans engagement) augmente le risque de résiliation."
        if contract_value in {"one year", "two year"} and direction == "decreases":
            return "Un contrat avec engagement contribue à réduire le risque de résiliation."
    if feature == "Tenure" and tenure_value < 12 and direction == "increases":
        return "Une ancienneté faible indique une fidélité limitée et augmente le risque de résiliation."
    if feature == "MonthlyCharges" and monthly_charges_value >= MONTHLY_CHARGES_HIGH_THRESHOLD and direction == "increases":
        return "Des frais mensuels élevés renforcent la sensibilité au prix et augmentent le risque de résiliation."
    if feature == "MonthlyCharges" and direction == "decreases":
        return "Le niveau des frais mensuels contribue à réduire le risque de résiliation."
    if feature == "PaymentMethod" and payment_method_value == "electronic check" and direction == "increases":
        return "Le paiement par chèque électronique est associé à un risque de résiliation plus élevé."

    if direction == "increases":
        return f"Le facteur '{feature}' augmente le risque de résiliation."
    return f"Le facteur '{feature}' contribue à réduire le risque de résiliation."

