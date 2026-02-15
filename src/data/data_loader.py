from __future__ import annotations

import pandas as pd

from src.utils.data_utils import standardize_columns


def load_data(path: str) -> pd.DataFrame:
    """Load churn data and print diagnostics."""
    print(f"[data_loader] Loading data from: {path}")
    df = pd.read_csv(path)
    df = standardize_columns(df)

    if "TotalCharges" in df.columns:
        df["TotalCharges"] = pd.to_numeric(
            df["TotalCharges"].astype(str).str.replace(",", "", regex=False).str.strip(),
            errors="coerce",
        )

    print(f"[data_loader] Shape: {df.shape}")
    print("[data_loader] Columns:", list(df.columns))
    print("[data_loader] Dtypes:")
    print(df.dtypes)
    print("[data_loader] Missing values per column:")
    print(df.isna().sum())

    return df
