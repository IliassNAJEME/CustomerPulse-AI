import { useState } from 'react';
import { Header } from './components/Header';
import { APISettings } from './components/APISettings';
import { SinglePredictionForm } from './components/SinglePredictionForm';
import { PredictionResult } from './components/PredictionResult';
import { CSVUploadForm } from './components/CSVUploadForm';
import { CSVDashboard } from './components/CSVDashboard';

// Utility functions
const toBaseUrl = (url) => url.trim().replace(/\/+$/, '');

const normalizeApiError = (body, fallback) => {
  if (!body) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail
      .map(item => (typeof item?.msg === 'string' ? item.msg : JSON.stringify(item)))
      .join(' | ');
  }
  return fallback;
};

const parseNumberField = (value, fieldName, { integer = false } = {}) => {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');

  if (!normalized) {
    throw new Error(`Le champ "${fieldName}" est requis.`);
  }

  const parsedValue = Number(normalized);
  if (Number.isNaN(parsedValue)) {
    throw new Error(`Le champ "${fieldName}" doit contenir un nombre valide.`);
  }
  if (integer && !Number.isInteger(parsedValue)) {
    throw new Error(`Le champ "${fieldName}" doit être un entier.`);
  }

  return parsedValue;
};

const buildSinglePayload = (form) => ({
  Age: parseNumberField(form.Age, 'Age', { integer: true }),
  Gender: form.Gender,
  Tenure: parseNumberField(form.Tenure, 'Tenure', { integer: true }),
  MonthlyCharges: parseNumberField(form.MonthlyCharges, 'MonthlyCharges'),
  Contract: form.Contract,
  PaymentMethod: form.PaymentMethod,
  TotalCharges: parseNumberField(form.TotalCharges, 'TotalCharges'),
});

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://127.0.0.1:8000');
  const [testStatus, setTestStatus] = useState('idle');

  // Single prediction states
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [singleError, setSingleError] = useState('');

  // CSV states
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [csvInsights, setCsvInsights] = useState(null);

  const handleApiUrlChange = async (newUrl) => {
    setApiBaseUrl(newUrl);
    setTestStatus('testing');
    
    try {
      const response = await fetch(`${toBaseUrl(newUrl)}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);
      
      setTestStatus(response?.ok ? 'success' : 'error');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const onPredictSingle = async (form) => {
    setSingleLoading(true);
    setSingleError('');
    setSingleResult(null);

    try {
      const payload = buildSinglePayload(form);
      const response = await fetch(`${toBaseUrl(apiBaseUrl)}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(normalizeApiError(body, 'Erreur du backend'));
      }

      setSingleResult(body);
    } catch (err) {
      setSingleError(err.message || 'Erreur inconnue');
    } finally {
      setSingleLoading(false);
    }
  };

  const onPredictCsv = async (file) => {
    setCsvError('');
    setCsvMessage('');
    setCsvRows([]);
    setCsvInsights(null);

    if (!file) {
      setCsvError('Veuillez sélectionner un fichier CSV.');
      return;
    }

    setCsvLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${toBaseUrl(apiBaseUrl)}/predict-csv`, {
        method: 'POST',
        body: formData,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(normalizeApiError(body, 'La prédiction CSV a échoué'));
      }

      const rows = Array.isArray(body.rows)
        ? body.rows
        : Array.isArray(body.predictions)
          ? body.predictions
          : [];
      setCsvRows(rows);

      const insights =
        body && typeof body.n_rows === 'number'
          ? {
              n_rows: body.n_rows,
              probability_mean: Number(body.probability_mean ?? 0),
              high_risk_count: Number(body.high_risk_count ?? 0),
              high_risk_rate: Number(body.high_risk_rate ?? 0),
              risk_level_global: body.risk_level_global ?? 'FAIBLE',
              segments: body.segments ?? {
                high: { count: 0, rate: 0 },
                medium: { count: 0, rate: 0 },
                low: { count: 0, rate: 0 },
              },
              global_top_drivers: Array.isArray(body.global_top_drivers) ? body.global_top_drivers : [],
              recommendations: Array.isArray(body.recommendations) ? body.recommendations : [],
            }
          : null;
      setCsvInsights(insights);

      setCsvMessage(`Analyse terminée. ${body.row_count ?? rows.length} lignes prédites.`);
    } catch (err) {
      setCsvError(err.message || 'Erreur CSV inconnue');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <APISettings apiBaseUrl={apiBaseUrl} onChange={handleApiUrlChange} testStatus={testStatus} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <SinglePredictionForm 
              onSubmit={onPredictSingle}
              loading={singleLoading}
              error={singleError}
            />
            <div className="mt-6">
              <PredictionResult result={singleResult} />
            </div>
          </div>

          <div>
            <CSVUploadForm 
              onSubmit={onPredictCsv}
              loading={csvLoading}
              error={csvError}
              message={csvMessage}
            />
          </div>
        </div>

        {csvInsights && (
          <div className="mt-8">
            <CSVDashboard insights={csvInsights} rows={csvRows} />
          </div>
        )}

        <footer className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
          <p>CustomerPulse AI © 2024 • Prédiction intelligente de churn client</p>
        </footer>
      </main>
    </div>
  );
}
