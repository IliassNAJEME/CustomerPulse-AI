from __future__ import annotations

import joblib
import pandas as pd


def load_model(model_path: str):
    """Load a persisted churn model pipeline."""
    print(f"[inference] Loading model from: {model_path}")
    return joblib.load(model_path)


def predict_churn_proba(model, client_dict: dict) -> tuple[float, str]:
    """Predict churn probability for a single client dict."""
    client_df = pd.DataFrame([client_dict])
    proba = float(model.predict_proba(client_df)[0, 1])
    return proba, f"{proba:.0%}"


def print_example_predictions(model) -> None:
    """Print two example client predictions."""
    client_a = {
        "Age": 58,
        "Gender": "Female",
        "Tenure": 4,
        "MonthlyCharges": 119.9,
        "Contract": "Month-to-month",
        "PaymentMethod": "Electronic check",
        "TotalCharges": 420.5,
    }
    client_b = {
        "Age": 37,
        "Gender": "Male",
        "Tenure": 62,
        "MonthlyCharges": 45.2,
        "Contract": "Two year",
        "PaymentMethod": "Bank transfer",
        "TotalCharges": 2810.7,
    }

    proba_a, pct_a = predict_churn_proba(model, client_a)
    proba_b, pct_b = predict_churn_proba(model, client_b)

    print(f"Client A -> {proba_a:.2f} ({pct_a} risque)")
    print(f"Client B -> {proba_b:.2f} ({pct_b} risque)")
