from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def build_preprocessor(df: pd.DataFrame) -> ColumnTransformer:
    """Build preprocessing pipeline with automatic numeric/categorical detection."""
    numeric_features = df.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_features = [col for col in df.columns if col not in numeric_features]

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ],
        remainder="drop",
    )

    print(f"[preprocessing] Numeric columns: {numeric_features}")
    print(f"[preprocessing] Categorical columns: {categorical_features}")

    return preprocessor
