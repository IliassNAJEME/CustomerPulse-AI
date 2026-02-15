import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function APISettings({ apiBaseUrl, onChange, testStatus }) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiBaseUrl);

  useEffect(() => {
    setTempUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  const handleSave = () => {
    onChange(tempUrl);
    setShowSettings(false);
  };

  const testStatusMap = {
    idle: null,
    testing: 'En test...',
    success: 'Connecté',
    error: 'Erreur de connexion',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Configuration API</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {apiBaseUrl}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {testStatus && testStatusMap[testStatus] && (
            <>
              {testStatus === 'success' && (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              )}
              {testStatus === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {testStatus === 'testing' && (
                <span className="spinner h-5 w-5" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {testStatusMap[testStatus]}
              </span>
            </>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <label className="field">
            URL de l'API
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Exemple : http://127.0.0.1:8000 ou https://api.example.com
            </p>
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn btn-primary flex-1">
              Appliquer
            </button>
            <button onClick={() => setShowSettings(false)} className="btn btn-secondary flex-1">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
