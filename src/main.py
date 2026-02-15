from __future__ import annotations

import json
from pathlib import Path

import joblib
from sklearn.model_selection import train_test_split

from src.data.data_loader import load_data
from src.features.preprocessing import build_preprocessor
from src.inference.predictor import print_example_predictions
from src.models.evaluation import evaluate, select_best_model
from src.models.training import train_models
from src.utils.config import DATA_PATH, METRICS_PATH, MODEL_PATH, RANDOM_STATE
from src.utils.data_utils import drop_identifier_columns, encode_target, find_target_column


def main() -> None:
    data = load_data(DATA_PATH)

    target_col = find_target_column(list(data.columns))
    print(f"[main] Target column detected: {target_col}")

    data = drop_identifier_columns(data)

    y = encode_target(data[target_col])
    X = data.drop(columns=[target_col])

    print("[main] Target distribution:")
    print(y.value_counts(normalize=False).sort_index())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    preprocessor = build_preprocessor(X_train)
    models = train_models(X_train, y_train, preprocessor)

    all_metrics = {}
    for model_name, model in models.items():
        print(f"[main] Evaluating model: {model_name}")
        all_metrics[model_name] = evaluate(model, X_test, y_test)

    best_model_name = select_best_model(all_metrics)
    best_model = models[best_model_name]
    print(f"[main] Best model selected: {best_model_name}")

    model_path = Path(MODEL_PATH)
    metrics_path = Path(METRICS_PATH)
    model_path.parent.mkdir(parents=True, exist_ok=True)
    metrics_path.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(best_model, model_path)
    print(f"[main] Saved best model to: {model_path}")

    metrics_payload = {
        "selection_metric": "roc_auc (fallback: f1)",
        "best_model": best_model_name,
        "metrics_by_model": all_metrics,
    }
    metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")
    print(f"[main] Saved metrics to: {metrics_path}")

    print_example_predictions(best_model)


if __name__ == "__main__":
    main()
