import { BarChart3, Moon, Sun, TrendingUp } from 'lucide-react';

export function Header({ darkMode, onToggleDarkMode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">CustomerPulse AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Prédiction intelligente de risque de churn</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Analyse en temps réel</span>
            </div>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
