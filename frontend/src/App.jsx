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
        {/* API Settings */}
        <APISettings apiBaseUrl={apiBaseUrl} onChange={handleApiUrlChange} testStatus={testStatus} />

        {/* Prediction Sections */}
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

        {/* CSV Dashboard */}
        {csvInsights && (
          <div className="mt-8">
            <CSVDashboard insights={csvInsights} rows={csvRows} />
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
          <p>CustomerPulse AI © 2024 • Prédiction intelligente de churn client</p>
        </footer>
      </main>
    </div>
  );
}
  return fallback;
};

const parseNumberField = (value, fieldName, { integer = false } = {}) => {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");

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
  Age: parseNumberField(form.Age, "Age", { integer: true }),
  Gender: form.Gender,
  Tenure: parseNumberField(form.Tenure, "Tenure", { integer: true }),
  MonthlyCharges: parseNumberField(form.MonthlyCharges, "MonthlyCharges"),
  Contract: form.Contract,
  PaymentMethod: form.PaymentMethod,
  TotalCharges: parseNumberField(form.TotalCharges, "TotalCharges"),
});

const clampPercent = (value) => Math.max(0, Math.min(100, value * 100));

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://127.0.0.1:8000");
  const [form, setForm] = useState(defaultForm);

  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [singleError, setSingleError] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvMessage, setCsvMessage] = useState("");
  const [csvError, setCsvError] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvSummary, setCsvSummary] = useState(null);
  const [csvInsights, setCsvInsights] = useState(null);

  const riskTone = useMemo(() => {
    if (!singleResult) return riskStyles.LOW;
    return riskStyles[singleResult.risk_level] ?? riskStyles.MEDIUM;
  }, [singleResult]);

  const globalRiskTone = useMemo(() => {
    if (!csvInsights) return globalRiskStyles.FAIBLE;
    return globalRiskStyles[csvInsights.risk_level_global] ?? globalRiskStyles.MOYEN;
  }, [csvInsights]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onPredictSingle = async (event) => {
    event.preventDefault();
    setSingleLoading(true);
    setSingleError("");
    setSingleResult(null);

    try {
      const payload = buildSinglePayload(form);
      const response = await fetch(`${toBaseUrl(apiBaseUrl)}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(normalizeApiError(body, "Erreur du backend"));
      }

      setSingleResult(body);
    } catch (err) {
      setSingleError(err.message || "Erreur inconnue");
    } finally {
      setSingleLoading(false);
    }
  };

  const onPredictCsv = async (event) => {
    event.preventDefault();
    setCsvError("");
    setCsvMessage("");
    setCsvRows([]);
    setCsvSummary(null);
    setCsvInsights(null);

    if (!csvFile) {
      setCsvError("Veuillez sélectionner un fichier CSV.");
      return;
    }

    setCsvLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(`${toBaseUrl(apiBaseUrl)}/predict-csv`, {
        method: "POST",
        body: formData,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(normalizeApiError(body, "La prédiction CSV a échoué"));
      }

      const rows = Array.isArray(body.rows)
        ? body.rows
        : Array.isArray(body.predictions)
          ? body.predictions
          : [];
      setCsvRows(rows);

      const insights =
        body && typeof body.n_rows === "number"
          ? {
              n_rows: body.n_rows,
              probability_mean: Number(body.probability_mean ?? 0),
              high_risk_count: Number(body.high_risk_count ?? 0),
              high_risk_rate: Number(body.high_risk_rate ?? 0),
              risk_level_global: body.risk_level_global ?? "FAIBLE",
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

      setCsvSummary(
        body.summary ??
          (insights
            ? {
                avg_probability: insights.probability_mean,
                high_risk_count: insights.high_risk_count,
                high_risk_rate: insights.high_risk_rate,
              }
            : null),
      );

      setCsvMessage(`Analyse terminée. ${body.row_count ?? rows.length} lignes prédites dans l'interface.`);
    } catch (err) {
      setCsvError(err.message || "Erreur CSV inconnue");
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-cyan-50 to-blue-100 px-4 py-8 font-display text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-5">
        <section className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-glass backdrop-blur">
          <h1 className="text-3xl font-bold tracking-tight">Studio du risque de résiliation</h1>
          <p className="mt-2 text-slate-600">
            Interface React + Tailwind. Analysez un client ou importez un CSV pour évaluer toutes les lignes.
          </p>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-glass backdrop-blur">
          <label className="field mb-4">
            URL de l'API
            <input
              className="input"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
            />
          </label>

          <form onSubmit={onPredictSingle} className="grid gap-4 md:grid-cols-2">
            <h2 className="text-xl font-semibold md:col-span-2">Prédiction client unitaire</h2>

            <label className="field">
              Age
              <input className="input" type="number" min="0" max="120" name="Age" value={form.Age} onChange={onChange} required />
            </label>

            <label className="field">
              Genre
              <select className="input" name="Gender" value={form.Gender} onChange={onChange}>
                <option value="Female">Femme</option>
                <option value="Male">Homme</option>
              </select>
            </label>

            <label className="field">
              Ancienneté (mois)
              <input className="input" type="number" min="0" name="Tenure" value={form.Tenure} onChange={onChange} required />
            </label>

            <label className="field">
              Frais mensuels
              <input
                className="input"
                type="text"
                inputMode="decimal"
                name="MonthlyCharges"
                value={form.MonthlyCharges}
                onChange={onChange}
                required
              />
            </label>

            <label className="field">
              Type de contrat
              <select className="input" name="Contract" value={form.Contract} onChange={onChange}>
                <option value="Month-to-month">Mensuel (sans engagement)</option>
                <option value="One year">1 an</option>
                <option value="Two year">2 ans</option>
              </select>
            </label>

            <label className="field">
              Mode de paiement
              <select className="input" name="PaymentMethod" value={form.PaymentMethod} onChange={onChange}>
                <option value="Electronic check">Chèque électronique</option>
                <option value="Mailed check">Chèque postal</option>
                <option value="Bank transfer">Virement bancaire</option>
                <option value="Credit card">Carte bancaire</option>
              </select>
            </label>

            <label className="field md:col-span-2">
              Frais totaux
              <input
                className="input"
                type="text"
                inputMode="decimal"
                name="TotalCharges"
                value={form.TotalCharges}
                onChange={onChange}
                required
              />
            </label>

            <button
              className="md:col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={singleLoading}
            >
              {singleLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                "Prédire le risque"
              )}
            </button>
          </form>

          <div className="mt-5">
            {singleError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4">
                <p className="font-semibold text-rose-700">Échec de l'analyse</p>
                <p className="mt-1 text-sm text-rose-700">{singleError}</p>
              </div>
            ) : null}

            {!singleError && !singleResult ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-slate-600">En attente d'analyse...</div>
            ) : null}

            {singleResult ? (
              <div className="grid gap-4">
                <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={`text-lg font-semibold ${riskTone.text}`}>
                      Risque de résiliation: {(singleResult.probability * 100).toFixed(0)}% (probabilité={singleResult.probability.toFixed(4)})
                    </p>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskTone.badge}`}>
                      {riskLabels[singleResult.risk_level] ?? singleResult.risk_level}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${riskTone.bar}`}
                        style={{ width: `${clampPercent(singleResult.probability)}%` }}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <h3 className="text-base font-semibold text-slate-900">Facteurs principaux</h3>
                  <ul className="mt-3 grid gap-2">
                    {(singleResult.top_drivers ?? []).map((driver, index) => (
                      <li key={`${driver.feature}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-800">{driver.feature}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              driver.direction === "increases" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {driver.direction === "increases" ? "augmente le risque" : "réduit le risque"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{driver.human_explanation}</p>
                        <p className="mt-1 text-xs text-slate-500">Impact SHAP : {Number(driver.shap_value).toFixed(4)}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white/90 p-4">
                  <h3 className="text-base font-semibold text-slate-900">Actions commerciales recommandées</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {(singleResult.recommendations ?? []).map((recommendation) => (
                      <li key={recommendation}>{recommendation}</li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}
          </div>

          <form onSubmit={onPredictCsv} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
            <h2 className="text-xl font-semibold">Prédiction en lot via CSV</h2>
            <p className="text-sm text-slate-600">
              Importez un CSV avec les colonnes : Age, Gender, Tenure, MonthlyCharges, Contract, PaymentMethod, TotalCharges.
            </p>
            <input
              className="input"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            />
            <button
              className="rounded-xl bg-gradient-to-r from-indigo-700 to-sky-600 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={csvLoading}
            >
              {csvLoading ? "Traitement du CSV..." : "Prédire toutes les lignes dans l'interface"}
            </button>

            {csvError ? <p className="font-semibold text-rose-600">Erreur : {csvError}</p> : null}
            {csvMessage ? <p className="font-semibold text-teal-700">{csvMessage}</p> : null}
            {csvSummary ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p>Probabilité moyenne : {csvSummary.avg_probability.toFixed(4)}</p>
                <p>Clients à risque élevé (&gt;= 0.7) : {csvSummary.high_risk_count}</p>
                <p>Taux de risque élevé : {(csvSummary.high_risk_rate * 100).toFixed(2)}%</p>
              </div>
            ) : null}
          </form>

          {csvRows.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <p className="mb-3 text-sm text-slate-600">
                Affichage des 200 clients présentant le risque le plus élevé (sur {csvInsights?.n_rows ?? csvRows.length} clients analysés).
              </p>
              <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Identifiant client</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Risque (%)</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Niveau</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Contrat</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Ancienneté (mois)</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Frais mensuels</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Paiement</th>
                      <th className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">Total facturé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 200).map((row, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-slate-50/70">
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row["Customer ID"] == null ? "" : String(row["Customer ID"])}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.churn_risk_percent == null ? "" : String(row.churn_risk_percent)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.risk_level == null ? "" : String(row.risk_level)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.Contract == null ? "" : String(row.Contract)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.Tenure == null ? "" : String(row.Tenure)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.MonthlyCharges == null ? "" : String(row.MonthlyCharges)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.PaymentMethod == null ? "" : String(row.PaymentMethod)}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{row.TotalCharges == null ? "" : String(row.TotalCharges)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {csvInsights ? (
            <section className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-5">
              <h3 className="text-xl font-semibold text-slate-900">Synthèse décisionnelle (Entreprise)</h3>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-700">Fichier analysé : {csvInsights.n_rows} clients</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Clients à risque élevé : {csvInsights.high_risk_count} ({(csvInsights.high_risk_rate * 100).toFixed(2)}%)
                  </p>
                  <p className="mt-1 text-sm text-slate-700">Probabilité moyenne : {csvInsights.probability_mean.toFixed(4)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">Conclusion :</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${globalRiskTone.badge}`}>
                      Risque global {csvInsights.risk_level_global}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">Segmentation des risques</h4>
                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Élevé</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${segmentStyles.high}`}>
                        {csvInsights.segments.high.count} ({(csvInsights.segments.high.rate * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Moyen</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${segmentStyles.medium}`}>
                        {csvInsights.segments.medium.count} ({(csvInsights.segments.medium.rate * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Faible</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${segmentStyles.low}`}>
                        {csvInsights.segments.low.count} ({(csvInsights.segments.low.rate * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">Facteurs dominants</h4>
                  <ul className="mt-3 grid gap-3">
                    {(csvInsights.global_top_drivers ?? []).map((driver) => (
                      <li key={driver.feature} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{driver.feature}</p>
                          <span className="text-xs font-semibold text-slate-600">{(Number(driver.importance) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{ width: `${Math.max(4, Math.min(100, Number(driver.importance) * 100))}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-600">{driver.interpretation}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">Actions commerciales recommandées</h4>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {(csvInsights.recommendations ?? []).map((recommendation) => (
                      <li key={recommendation}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
