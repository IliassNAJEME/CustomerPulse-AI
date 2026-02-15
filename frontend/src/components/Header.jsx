import { BarChart3, TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">CustomerPulse AI</h1>
              <p className="text-xs text-slate-500">Prédiction intelligente de risque de churn</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Analyse en temps réel</span>
          </div>
        </div>
      </div>
    </header>
  );
}
