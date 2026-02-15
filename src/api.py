from __future__ import annotations

import io
from pathlib import Path

import pandas as pd
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.inference.predictor import load_model, predict_churn_proba
from src.utils.config import MODEL_PATH, TARGET_COLUMN_ALIASES
from src.utils.data_utils import drop_identifier_columns, normalize_column_name, standardize_columns

app = FastAPI(title="Churn Backend API", version="2.1.0")

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


def get_model():
    global _MODEL
    if _MODEL is None:
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            raise HTTPException(
                status_code=400,
                detail="Model not found. Run training first: python -m src.main",
            )
        _MODEL = load_model(str(model_path))
    return _MODEL


def _prepare_batch_features(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = standardize_columns(raw_df.copy())
    df = drop_identifier_columns(df)

    target_cols = [col for col in df.columns if normalize_column_name(col) in TARGET_COLUMN_ALIASES]
    if target_cols:
        df = df.drop(columns=target_cols)

    missing_cols = [col for col in REQUIRED_FEATURES if col not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns for prediction: {missing_cols}",
        )

    return df[REQUIRED_FEATURES].copy()


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
    probabilities = model.predict_proba(features_df)[:, 1]

    output_df = raw_df.copy()
    output_df["churn_probability"] = probabilities.round(6)
    output_df["churn_risk_percent"] = (probabilities * 100).round(2).astype(str) + "%"
    output_df = output_df.where(pd.notnull(output_df), None)

    high_risk_mask = probabilities >= 0.5
    return {
        "filename": file.filename,
        "row_count": int(len(output_df)),
        "summary": {
            "avg_probability": float(probabilities.mean()),
            "high_risk_count": int(high_risk_mask.sum()),
            "high_risk_rate": float(high_risk_mask.mean()),
        },
        "predictions": output_df.to_dict(orient="records"),
    }


if __name__ == "__main__":
    uvicorn.run("src.api:app", host="127.0.0.1", port=8000, reload=True)
