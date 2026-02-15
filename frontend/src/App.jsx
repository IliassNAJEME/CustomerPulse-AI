import { useMemo, useState } from "react";

const defaultForm = {
  Age: 45,
  Gender: "Female",
  Tenure: 10,
  MonthlyCharges: 70.5,
  Contract: "Month-to-month",
  PaymentMethod: "Electronic check",
  TotalCharges: 705,
};

const toBaseUrl = (url) => url.trim().replace(/\/+$/, "");

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

  const riskTone = useMemo(() => {
    if (!singleResult) return "text-slate-700";
    return singleResult.churn_probability >= 0.5 ? "text-rose-600" : "text-teal-700";
  }, [singleResult]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["Age", "Tenure", "MonthlyCharges", "TotalCharges"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const onPredictSingle = async (event) => {
    event.preventDefault();
    setSingleLoading(true);
    setSingleError("");
    setSingleResult(null);

    try {
      const response = await fetch(`${toBaseUrl(apiBaseUrl)}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || "Backend error");
      }

      setSingleResult(body);
    } catch (err) {
      setSingleError(err.message || "Unknown error");
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

    if (!csvFile) {
      setCsvError("Please select a CSV file.");
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
        throw new Error(body.detail || "CSV prediction failed");
      }

      const rows = Array.isArray(body.predictions) ? body.predictions : [];
      setCsvRows(rows);
      setCsvSummary(body.summary ?? null);
      setCsvMessage(`Prediction done. ${body.row_count ?? rows.length} rows predicted in interface.`);
    } catch (err) {
      setCsvError(err.message || "Unknown CSV error");
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-cyan-50 to-blue-100 px-4 py-8 font-display text-slate-900">
      <div className="mx-auto grid max-w-5xl gap-5">
        <section className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-glass backdrop-blur">
          <h1 className="text-3xl font-bold tracking-tight">Churn Risk Studio</h1>
          <p className="mt-2 text-slate-600">
            React + Tailwind frontend. Predict one customer or upload a CSV to predict all rows.
          </p>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-glass backdrop-blur">
          <label className="field mb-4">
            API Base URL
            <input
              className="input"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
            />
          </label>

          <form onSubmit={onPredictSingle} className="grid gap-4 md:grid-cols-2">
            <h2 className="md:col-span-2 text-xl font-semibold">Single customer prediction</h2>

            <label className="field">
              Age
              <input className="input" type="number" min="0" max="120" name="Age" value={form.Age} onChange={onChange} required />
            </label>

            <label className="field">
              Gender
              <select className="input" name="Gender" value={form.Gender} onChange={onChange}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>

            <label className="field">
              Tenure (months)
              <input className="input" type="number" min="0" name="Tenure" value={form.Tenure} onChange={onChange} required />
            </label>

            <label className="field">
              MonthlyCharges
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                name="MonthlyCharges"
                value={form.MonthlyCharges}
                onChange={onChange}
                required
              />
            </label>

            <label className="field">
              Contract
              <select className="input" name="Contract" value={form.Contract} onChange={onChange}>
                <option value="Month-to-month">Month-to-month</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year</option>
              </select>
            </label>

            <label className="field">
              PaymentMethod
              <select className="input" name="PaymentMethod" value={form.PaymentMethod} onChange={onChange}>
                <option value="Electronic check">Electronic check</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer">Bank transfer</option>
                <option value="Credit card">Credit card</option>
              </select>
            </label>

            <label className="field md:col-span-2">
              TotalCharges
              <input
                className="input"
                type="number"
                step="0.01"
                min="0"
                name="TotalCharges"
                value={form.TotalCharges}
                onChange={onChange}
                required
              />
            </label>

            <button
              className="md:col-span-2 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={singleLoading}
            >
              {singleLoading ? "Predicting..." : "Predict churn"}
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4">
            {singleError ? <p className="font-semibold text-rose-600">Error: {singleError}</p> : null}
            {!singleError && !singleResult ? <p className="text-slate-600">Waiting for prediction...</p> : null}
            {singleResult ? (
              <p className={`text-lg font-semibold ${riskTone}`}>
                Churn risk: {singleResult.risk_percent} (probability={singleResult.churn_probability.toFixed(4)})
              </p>
            ) : null}
          </div>

          <form onSubmit={onPredictCsv} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
            <h2 className="text-xl font-semibold">Batch prediction from CSV</h2>
            <p className="text-sm text-slate-600">
              Upload a CSV with columns: Age, Gender, Tenure, MonthlyCharges, Contract, PaymentMethod, TotalCharges.
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
              {csvLoading ? "Processing CSV..." : "Predict all rows in interface"}
            </button>

            {csvError ? <p className="font-semibold text-rose-600">Error: {csvError}</p> : null}
            {csvMessage ? <p className="font-semibold text-teal-700">{csvMessage}</p> : null}
            {csvSummary ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p>Average probability: {csvSummary.avg_probability.toFixed(4)}</p>
                <p>High risk clients (&gt;= 0.5): {csvSummary.high_risk_count}</p>
                <p>High risk rate: {(csvSummary.high_risk_rate * 100).toFixed(2)}%</p>
              </div>
            ) : null}
          </form>

          {csvRows.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4">
              <p className="mb-3 text-sm text-slate-600">
                Showing {Math.min(csvRows.length, 200)} of {csvRows.length} predicted rows.
              </p>
              <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      {Object.keys(csvRows[0]).map((col) => (
                        <th key={col} className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 200).map((row, idx) => (
                      <tr key={idx} className="odd:bg-white even:bg-slate-50/70">
                        {Object.keys(csvRows[0]).map((col) => (
                          <td key={`${idx}-${col}`} className="border-b border-slate-100 px-3 py-2 text-slate-700">
                            {row[col] == null ? "" : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
