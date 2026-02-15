from __future__ import annotations

import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score


def evaluate(model, X_test, y_test) -> dict:
    """Evaluate a binary classifier and return key metrics."""
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    labels, counts = np.unique(y_test, return_counts=True)
    class_distribution = {str(label): int(count) for label, count in zip(labels, counts)}

    try:
        roc_auc = roc_auc_score(y_test, y_proba)
    except ValueError:
        roc_auc = float("nan")

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "class_distribution": class_distribution,
    }

    print("[evaluation] Class distribution:", class_distribution)
    print(
        "[evaluation] accuracy={accuracy:.4f} precision={precision:.4f} "
        "recall={recall:.4f} f1={f1:.4f} roc_auc={roc_auc:.4f}".format(**metrics)
    )

    return metrics


def select_best_model(metrics_by_model: dict) -> str:
    def score(item):
        _, metrics = item
        roc_auc = metrics.get("roc_auc", float("nan"))
        if np.isnan(roc_auc):
            return metrics.get("f1", float("-inf"))
        return roc_auc

    best_name, _ = max(metrics_by_model.items(), key=score)
    return best_name
