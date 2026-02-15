from __future__ import annotations

from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from src.utils.config import RANDOM_STATE


def train_models(X_train, y_train, preprocessor) -> dict:
    """Train multiple pipelined models and return a model dict."""
    model_specs = {
        "logistic_regression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            class_weight="balanced_subsample",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }

    trained_models = {}
    for name, estimator in model_specs.items():
        print(f"[training] Training model: {name}")
        pipeline = Pipeline(
            steps=[
                ("preprocessor", clone(preprocessor)),
                ("classifier", estimator),
            ]
        )
        pipeline.fit(X_train, y_train)
        trained_models[name] = pipeline

    return trained_models
