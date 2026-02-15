import { useRef } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export function CSVUploadForm({ onSubmit, loading, error, message }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    onSubmit(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    const file = e.dataTransfer.files?.[0];
    if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) {
      onSubmit(file);
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-start gap-3">
        <Upload className="mt-1 h-5 w-5 text-blue-600 flex-shrink-0" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analyse en lot (CSV)</h2>
          <p className="mt-1 text-slate-600">Prédisez le risque pour plusieurs clients à la fois</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="mb-6 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Upload className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Déposez un fichier CSV ici</p>
          <p className="mt-1 text-xs text-slate-600">ou</p>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary text-sm"
          disabled={loading}
        >
          Parcourir les fichiers
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
        <p className="text-xs text-slate-500">
          Format accepté : CSV • Colonnes requises : Age, Gender, Tenure, MonthlyCharges, Contract, PaymentMethod, TotalCharges
        </p>
      </div>

      {error && (
        <div className="alert alert-danger flex gap-3 mb-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Erreur lors du traitement</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {message && !error && (
        <div className="alert alert-success flex gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {loading && (
        <div className="alert alert-info flex gap-3">
          <span className="spinner h-5 w-5" />
          <p>Traitement du fichier en cours...</p>
        </div>
      )}
    </div>
  );
}
