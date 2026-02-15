from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = str(PROJECT_ROOT / "data" / "synthetic_customer_churn_100k.csv")
MODEL_PATH = str(PROJECT_ROOT / "models" / "churn_model.joblib")
METRICS_PATH = str(PROJECT_ROOT / "reports" / "metrics.json")

RANDOM_STATE = 42

EXPECTED_COLUMNS = [
    "CustomerID",
    "Age",
    "Gender",
    "Tenure",
    "MonthlyCharges",
    "Contract",
    "PaymentMethod",
    "TotalCharges",
    "Churn",
]

COLUMN_NAME_MAPPING = {
    "customerid": "CustomerID",
    "idclient": "CustomerID",
    "age": "Age",
    "gender": "Gender",
    "sex": "Gender",
    "tenure": "Tenure",
    "anciennete": "Tenure",
    "monthlycharges": "MonthlyCharges",
    "paymentmethod": "PaymentMethod",
    "contract": "Contract",
    "totalcharges": "TotalCharges",
    "churn": "Churn",
    "target": "Churn",
    "label": "Churn",
}

TARGET_COLUMN_ALIASES = {"churn", "target", "label", "ischurn", "churned"}
ID_COLUMN_ALIASES = {"customerid", "idclient", "id"}
