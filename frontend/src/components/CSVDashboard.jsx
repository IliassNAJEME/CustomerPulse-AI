import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Zap } from 'lucide-react';

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

export function CSVDashboard({ insights, rows }) {
  if (!insights) return null;

  const riskDistribution = [
    { name: 'Faible risque', value: insights.segments?.low?.count || 0, color: RISK_COLORS.low },
    { name: 'Risque moyen', value: insights.segments?.medium?.count || 0, color: RISK_COLORS.medium },
    { name: 'Risque élevé', value: insights.segments?.high?.count || 0, color: RISK_COLORS.high },
  ].filter(item => item.value > 0);

  const highRiskRate = insights.high_risk_rate ? (insights.high_risk_rate * 100).toFixed(1) : 0;
  const avgProbability = insights.probability_mean ? (insights.probability_mean * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Clients analysés</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{insights.n_rows || 0}</p>
            </div>
            <Users className="h-10 w-10 text-blue-100" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Probabilité moyenne</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{avgProbability}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-amber-100" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Clients à haut risque</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{insights.high_risk_count || 0}</p>
              <p className="mt-1 text-xs text-slate-500">{highRiskRate}% du total</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-100" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Risque global</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {insights.risk_level_global === 'FAIBLE' && '✓'}
                {insights.risk_level_global === 'MOYEN' && '!'}
                {insights.risk_level_global === 'ÉLEVÉ' && '⚠'}
              </p>
              <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                insights.risk_level_global === 'FAIBLE' ? 'badge-success' :
                insights.risk_level_global === 'MOYEN' ? 'badge-warning' :
                'badge-danger'
              }`}>
                {insights.risk_level_global}
              </span>
            </div>
            <Zap className="h-10 w-10 text-emerald-100" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution Pie Chart */}
        {riskDistribution.length > 0 && (
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-slate-900">Distribution des risques</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} clients`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Drivers Bar Chart */}
        {insights.global_top_drivers && insights.global_top_drivers.length > 0 && (
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-slate-900">Facteurs principaux</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.global_top_drivers.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shap_value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-slate-900">Recommandations stratégiques</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {insights.recommendations.slice(0, 6).map((rec, idx) => (
              <div key={idx} className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <span className="flex-shrink-0 font-bold text-blue-600">•</span>
                <span className="text-sm text-slate-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {rows && rows.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-slate-900">
            Clients à risque élevé ({Math.min(rows.length, 200)} / {insights.n_rows} affichés)
          </h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID Client</th>
                  <th>Risque (%)</th>
                  <th>Niveau</th>
                  <th className="hidden sm:table-cell">Contrat</th>
                  <th className="hidden md:table-cell">Ancienneté</th>
                  <th className="hidden lg:table-cell">Frais mensuels</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, idx) => {
                  const riskPercent = row.churn_risk_percent ? parseFloat(row.churn_risk_percent).toFixed(1) : '0';
                  const riskLevel = row.risk_level || 'N/A';
                  const bgColor = 
                    riskLevel === 'FAIBLE' ? 'bg-emerald-50' :
                    riskLevel === 'MOYEN' ? 'bg-amber-50' :
                    'bg-red-50';

                  return (
                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="font-medium">{row['Customer ID'] || '-'}</td>
                      <td className="font-semibold">{riskPercent}%</td>
                      <td>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          riskLevel === 'FAIBLE' ? 'badge-success' :
                          riskLevel === 'MOYEN' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {riskLevel}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell text-sm">{row.Contract || '-'}</td>
                      <td className="hidden md:table-cell text-sm">{row.Tenure || '-'} m</td>
                      <td className="hidden lg:table-cell text-sm">€{row.MonthlyCharges || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <p className="mt-3 text-xs text-slate-500">
              Affichage des 50 premiers clients. Total: {rows.length} lignes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
