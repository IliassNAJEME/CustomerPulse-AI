from __future__ import annotations

import io
from pathlib import Path

import pandas as pd
import uvicorn
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.inference.explainer import (
    ShapComputationError,
    ShapDependencyError,
    build_batch_consulting_insights,
    explain_client_prediction,
    get_risk_level,
)
from src.inference.predictor import load_model, predict_churn_proba
from src.utils.config import MODEL_PATH, TARGET_COLUMN_ALIASES
from src.utils.data_utils import drop_identifier_columns, normalize_column_name, standardize_columns

app = FastAPI(title="Churn Backend API", version="2.2.0")

# Allows separated frontend to call backend from another origin/port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_MODEL = None


class ClientFeatures(BaseModel):
    Age: int = Field(..., ge=0, le=120)
    Gender: str
    Tenure: int = Field(..., ge=0)
    MonthlyCharges: float = Field(..., ge=0)
    Contract: str
    PaymentMethod: str
    TotalCharges: float = Field(..., ge=0)


REQUIRED_FEATURES = list(ClientFeatures.model_fields.keys())
CSV_COLUMN_ALIASES = {
    "Tenure in Months": "Tenure",
    "Monthly Charge": "MonthlyCharges",
    "Payment Method": "PaymentMethod",
    "Total Charges": "TotalCharges",
}


def get_model():
    global _MODEL
    if _MODEL is None:
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Model not found. Run training first: python -m src.main",
            )
        _MODEL = load_model(str(model_path))
    return _MODEL


def _normalize_uploaded_csv_columns(raw_df: pd.DataFrame) -> pd.DataFrame:
    # Trim whitespace around uploaded headers first.
    df = raw_df.rename(columns=lambda col: col.strip() if isinstance(col, str) else col)

    missing_before_mapping = [col for col in REQUIRED_FEATURES if col not in df.columns]
    if not missing_before_mapping:
        return df

    rename_map: dict[str, str] = {}
    for source_col, target_col in CSV_COLUMN_ALIASES.items():
        if source_col in df.columns and target_col not in df.columns:
            rename_map[source_col] = target_col

    return df.rename(columns=rename_map) if rename_map else df


def _prepare_batch_features(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = _normalize_uploaded_csv_columns(raw_df.copy())
    df = standardize_columns(df)
    df = drop_identifier_columns(df)

    target_cols = [col for col in df.columns if normalize_column_name(col) in TARGET_COLUMN_ALIASES]
    if target_cols:
        df = df.drop(columns=target_cols)

    missing_cols = [col for col in REQUIRED_FEATURES if col not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Missing required columns for prediction: {missing_cols}. "
                f"Columns found in CSV: {list(df.columns)}"
            ),
        )

    return df[REQUIRED_FEATURES].copy()


def _to_french_risk_level(probability: float) -> str:
    risk_level = get_risk_level(probability)
    mapping = {
        "LOW": "FAIBLE",
        "MEDIUM": "MOYEN",
        "HIGH": "ÉLEVÉ",
    }
    return mapping[risk_level]


def _build_actionable_rows(raw_df: pd.DataFrame, probabilities: pd.Series) -> list[dict]:
    standardized_df = standardize_columns(_normalize_uploaded_csv_columns(raw_df.copy()))

    if "CustomerID" in standardized_df.columns:
        customer_ids = standardized_df["CustomerID"]
    else:
        customer_ids = pd.Series([None] * len(standardized_df), index=standardized_df.index)

    monthly_charges = pd.to_numeric(standardized_df.get("MonthlyCharges"), errors="coerce")
    total_charges = pd.to_numeric(standardized_df.get("TotalCharges"), errors="coerce")
    tenure_values = pd.to_numeric(standardized_df.get("Tenure"), errors="coerce")

    output_df = pd.DataFrame(
        {
            "Customer ID": customer_ids,
            "churn_probability": probabilities.round(6),
            "churn_risk_percent": (probabilities * 100).map(lambda value: f"{value:.2f}%"),
            "risk_level": probabilities.map(_to_french_risk_level),
            "Contract": standardized_df.get("Contract"),
            "Tenure": tenure_values.round(0),
            "MonthlyCharges": monthly_charges.round(2),
            "PaymentMethod": standardized_df.get("PaymentMethod"),
            "TotalCharges": total_charges.round(2),
        },
        index=standardized_df.index,
    )

    output_df["Tenure"] = output_df["Tenure"].where(output_df["Tenure"].notna(), None)
    output_df["Tenure"] = output_df["Tenure"].map(lambda value: int(value) if value is not None else None)
    output_df["MonthlyCharges"] = output_df["MonthlyCharges"].map(
        lambda value: f"{float(value):.2f}" if pd.notna(value) else None
    )
    output_df["TotalCharges"] = output_df["TotalCharges"].map(
        lambda value: f"{float(value):.2f}" if pd.notna(value) else None
    )
    output_df = output_df.where(pd.notnull(output_df), None)

    # Keep only top-risk rows for table rendering.
    top_risk_rows_df = output_df.sort_values(by="churn_probability", ascending=False).head(200)
    return top_risk_rows_df.to_dict(orient="records")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    missing_fields: list[str] = []
    invalid_fields: list[str] = []

    for error in exc.errors():
        location = [str(part) for part in error.get("loc", ()) if part not in {"body", "query", "path"}]
        field_name = ".".join(location) if location else "payload"
        error_type = error.get("type", "")

        if "missing" in error_type:
            missing_fields.append(field_name)
        else:
            invalid_fields.append(field_name)

    message_parts = []
    if missing_fields:
        message_parts.append(f"Missing required fields: {sorted(set(missing_fields))}")
    if invalid_fields:
        message_parts.append(f"Invalid values for fields: {sorted(set(invalid_fields))}")

    detail = "Invalid request payload."
    if message_parts:
        detail = f"{detail} {' '.join(message_parts)}"

    return JSONResponse(status_code=422, content={"detail": detail, "errors": exc.errors()})


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: ClientFeatures) -> dict:
    model = get_model()
    proba, percent = predict_churn_proba(model, payload.model_dump())
    return {
        "churn_probability": proba,
        "risk_percent": percent,
    }


@app.post("/explain")
def explain(payload: ClientFeatures) -> dict:
    model = get_model()

    try:
        return explain_client_prediction(
            model=model,
            client_features=payload.model_dump(),
            required_features=REQUIRED_FEATURES,
        )
    except ShapDependencyError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except ShapComputationError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"{exc} Try: pip install shap",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"SHAP explanation failed. Try installing shap with: pip install shap. Details: {exc}",
        ) from exc


@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    decoded = None
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            decoded = data.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if decoded is None:
        raise HTTPException(status_code=400, detail="Could not decode CSV file.")

    try:
        raw_df = pd.read_csv(io.StringIO(decoded))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {exc}") from exc

    if raw_df.empty:
        raise HTTPException(status_code=400, detail="CSV has no rows.")

    features_df = _prepare_batch_features(raw_df)
    model = get_model()
    probabilities = pd.Series(model.predict_proba(features_df)[:, 1], index=features_df.index)
    rows_payload = _build_actionable_rows(raw_df=raw_df, probabilities=probabilities)
    insights = build_batch_consulting_insights(
        model=model,
        features_df=features_df,
        probabilities=probabilities.to_numpy(),
        required_features=REQUIRED_FEATURES,
    )

    return {
        "filename": file.filename,
        "row_count": int(len(features_df)),
        "summary": {
            "avg_probability": insights["probability_mean"],
            "high_risk_count": insights["high_risk_count"],
            "high_risk_rate": insights["high_risk_rate"],
        },
        "predictions": rows_payload,
        "rows": rows_payload,
        **insights,
    }


if __name__ == "__main__":
    uvicorn.run("src.api:app", host="127.0.0.1", port=8000, reload=True)
