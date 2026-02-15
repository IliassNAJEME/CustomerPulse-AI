import { useState } from 'react';
import { AlertCircle, Zap } from 'lucide-react';

const FORM_DEFAULTS = {
  Age: '45',
  Gender: 'Female',
  Tenure: '10',
  MonthlyCharges: '70.5',
  Contract: 'Month-to-month',
  PaymentMethod: 'Electronic check',
  TotalCharges: '705.0',
};

const FORM_FIELDS = [
  { name: 'Age', label: 'Âge', type: 'number', min: 0, max: 120, required: true },
  { name: 'Gender', label: 'Genre', type: 'select', options: [{ value: 'Female', label: 'Femme' }, { value: 'Male', label: 'Homme' }], required: true },
  { name: 'Tenure', label: 'Ancienneté (mois)', type: 'number', min: 0, required: true },
  { name: 'MonthlyCharges', label: 'Frais mensuels (€)', type: 'number', step: 0.01, required: true },
  { name: 'Contract', label: 'Type de contrat', type: 'select', options: [{ value: 'Month-to-month', label: 'Mensuel (sans engagement)' }, { value: 'One year', label: '1 an' }, { value: 'Two year', label: '2 ans' }], required: true },
  { name: 'PaymentMethod', label: 'Mode de paiement', type: 'select', options: [{ value: 'Electronic check', label: 'Chèque électronique' }, { value: 'Mailed check', label: 'Chèque postal' }, { value: 'Bank transfer', label: 'Virement bancaire' }, { value: 'Credit card', label: 'Carte bancaire' }], required: true },
  { name: 'TotalCharges', label: 'Frais totaux (€)', type: 'number', step: 0.01, required: true },
];

export function SinglePredictionForm({ onSubmit, loading, error, children }) {
  const [form, setForm] = useState(FORM_DEFAULTS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-6 flex items-start gap-3">
          <Zap className="mt-1 h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Prédiction individuelle</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Analysez le risque de churn d'un client en temps réel</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FORM_FIELDS.map(field => (
              <label key={field.name} className="field">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
                {field.type === 'select' ? (
                  <select 
                    name={field.name} 
                    value={form[field.name]} 
                    onChange={handleChange}
                    className="input"
                    required={field.required}
                  >
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    required={field.required}
                    className="input"
                  />
                )}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full sm:col-span-2 lg:col-span-3"
          >
            {loading ? (
              <>
                <span className="spinner h-4 w-4" />
                Analyse en cours...
              </>
            ) : (
              'Analyser le client'
            )}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger mt-5 flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erreur lors de l'analyse</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
