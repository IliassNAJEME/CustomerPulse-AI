# CustomerPulse-AI

Churn Prediction Project (FastAPI + ML pipeline + React/Tailwind UI).

## Architecture

```text
CustomerPulse-AI/
├─ data/
│  └─ synthetic_customer_churn_100k.csv
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     └─ index.css
├─ models/
│  └─ churn_model.joblib
├─ reports/
│  └─ metrics.json
├─ src/
│  ├─ api.py                      # FastAPI backend
│  ├─ main.py                     # training pipeline entrypoint
│  ├─ data/
│  │  └─ data_loader.py
│  ├─ features/
│  │  └─ preprocessing.py
│  ├─ models/
│  │  ├─ training.py
│  │  └─ evaluation.py
│  ├─ inference/
│  │  └─ predictor.py
│  └─ utils/
│     ├─ config.py
│     └─ data_utils.py
├─ requirements.txt
└─ README.md
