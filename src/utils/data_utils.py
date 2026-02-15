from __future__ import annotations

import numpy as np
import pandas as pd

from src.utils.config import COLUMN_NAME_MAPPING, ID_COLUMN_ALIASES, TARGET_COLUMN_ALIASES


def normalize_column_name(name: str) -> str:
    return "".join(ch for ch in name.strip().lower() if ch.isalnum())


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename_map: dict[str, str] = {}
    for col in df.columns:
        normalized = normalize_column_name(col)
        if normalized in COLUMN_NAME_MAPPING:
            rename_map[col] = COLUMN_NAME_MAPPING[normalized]
    return df.rename(columns=rename_map) if rename_map else df


def find_target_column(columns: list[str]) -> str:
    for col in columns:
        if normalize_column_name(col) in TARGET_COLUMN_ALIASES:
            return col
    raise ValueError("No target column found. Expected aliases include Churn/target/label.")


def drop_identifier_columns(df: pd.DataFrame) -> pd.DataFrame:
    cols_to_drop = [col for col in df.columns if normalize_column_name(col) in ID_COLUMN_ALIASES]
    if cols_to_drop:
        print(f"[main] Dropping identifier columns: {cols_to_drop}")
        return df.drop(columns=cols_to_drop)
    return df


def encode_target(series: pd.Series) -> pd.Series:
    if series.dtype.kind in {"i", "u", "f", "b"}:
        encoded = pd.Series(np.where(series.astype(float) > 0, 1, 0), index=series.index)
        return encoded.astype(int)

    normalized = series.astype(str).str.strip().str.lower()
    mapping = {
        "yes": 1,
        "y": 1,
        "1": 1,
        "true": 1,
        "churn": 1,
        "no": 0,
        "n": 0,
        "0": 0,
        "false": 0,
        "stay": 0,
    }
    encoded = normalized.map(mapping)

    if encoded.isna().any():
        fallback_numeric = pd.to_numeric(normalized, errors="coerce")
        encoded = encoded.fillna((fallback_numeric > 0).astype(float))

    if encoded.isna().any():
        invalid_values = sorted(series[encoded.isna()].astype(str).unique().tolist())
        raise ValueError(f"Unrecognized target values: {invalid_values}")

    return encoded.astype(int)
