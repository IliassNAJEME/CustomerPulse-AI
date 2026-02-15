import { CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RISK_CONFIG = {
  LOW: { badge: 'badge-success', bar: 'bg-emerald-500', label: 'FAIBLE', color: '#10b981' },
  MEDIUM: { badge: 'badge-warning', bar: 'bg-amber-500', label: 'MOYEN', color: '#f59e0b' },
  HIGH: { badge: 'badge-danger', bar: 'bg-red-500', label: 'ÉLEVÉ', color: '#ef4444' },
};

export function PredictionResult({ result }) {
  if (!result) return null;

  const riskConfig = RISK_CONFIG[result.risk_level] || RISK_CONFIG.MEDIUM;
  const probability = Number(result.probability);
  const riskPercent = (probability * 100).toFixed(1);

  const chartData = [
    { name: 'Churn', value: probability * 100 },
    { name: 'Retention', value: (1 - probability) * 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-elevated h-full p-6">
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Risque de résiliation</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-slate-900">{riskPercent}%</span>
                <span className={`badge ${riskConfig.badge}`}>{riskConfig.label}</span>
              </div>
            </div>

            <div className={`rounded-lg border p-4 ${riskConfig.badge}`}>
              <p className="font-medium">
                {probability < 0.3 && '✓ Ce client présente un faible risque de churn. Consolidez votre relation.'}
                {probability >= 0.3 && probability < 0.7 && '! Ce client mérite une attention particulière. Envisagez une approche proactive.'}
                {probability >= 0.7 && '⚠ Risque élevé ! Une intervention immédiate est recommandée.'}
              </p>
            </div>
          </div>
        </div>

        <div className="card h-full p-6">
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="mx-auto h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={72}>
                    <Cell fill={riskConfig.color} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Aucun risque (0%)</span>
                <span>Risque maximal (100%)</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${riskConfig.bar}`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {result.top_drivers && result.top_drivers.length > 0 && (
          <div className="card h-full p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Facteurs principaux
            </h3>
            <div className="space-y-3">
              {result.top_drivers.slice(0, 5).map((driver, idx) => {
                const isRiskIncreasing = driver.direction === 'increases';
                const absShap = Math.abs(Number(driver.shap_value));

                return (
                  <div key={`${driver.feature}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{driver.feature}</span>
                        <span className={`badge ${isRiskIncreasing ? 'badge-danger' : 'badge-success'}`}>
                          {isRiskIncreasing ? 'Augmente' : 'Réduit'} le risque
                        </span>
                      </div>
                      <span className="text-lg font-bold text-slate-700">{absShap.toFixed(3)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{driver.human_explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {result.recommendations && result.recommendations.length > 0 && (
          <div className="card h-full p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Actions recommandées
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <span className="flex-shrink-0 font-semibold text-emerald-700">→</span>
                  <span className="text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

