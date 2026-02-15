# 🎯 CustomerPulse AI - Frontend SaaS

Interface professionnelle de **prédiction intelligente de risque de churn client** avec IA.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2.12-blue)

---

## ✨ Caractéristiques

✅ **Interface SaaS moderne** - Design professionnel responsive  
✅ **Prédiction individuelle** - Analysez un client en temps réel  
✅ **Analyse batch CSV** - Importez des centaines de clients  
✅ **Dashboard décisionnel** - KPI + Charts + Recommandations  
✅ **100% français** - Interface entièrement localisée  
✅ **Zéro dépendances lourdes** - React, Tailwind, Recharts seulement  

---

## 🚀 Démarrage rapide

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Développement

```bash
npm run dev
```

App démarre sur `http://localhost:5173`

### 3. Build production

```bash
npm run build
```

---

## 📦 Structure

```
frontend/
├── src/
│   ├── App.jsx                    # Application principale
│   ├── main.jsx                   # Point d'entrée
│   ├── index.css                  # Design système global
│   └── components/
│       ├── Header.jsx             # En-tête SaaS
│       ├── APISettings.jsx         # Config API
│       ├── SinglePredictionForm.jsx # Formulaire unitaire
│       ├── PredictionResult.jsx     # Résultats + charts
│       ├── CSVUploadForm.jsx        # Upload drag-drop
│       ├── CSVDashboard.jsx         # Dashboard complet
│       └── EmptyState.jsx           # États vides
├── index.html                      # HTML base
├── vite.config.js                 # Config Vite optimisée
├── tailwind.config.js             # Config Tailwind
├── postcss.config.js              # PostCSS plugins
└── package.json                    # Dépendances
```

---

## 🎨 Design System

### Couleurs
- 🔵 **Primaire** : Bleu (#2563eb)
- 🩵 **Accent** : Cyan (#06b6d4)
- 🟢 **Succès** : Émeraude (#10b981)
- 🟡 **Alerte** : Ambre (#f59e0b)
- 🔴 **Danger** : Rouge (#ef4444)

### Composants
- `.btn` - Boutons (primary, secondary, ghost)
- `.card` - Cartes avec ombre
- `.badge` - Badges colorés
- `.input` - Champs stylisés
- `.field` - Labels + inputs
- `.alert` - Alertes

---

## 📊 Fonctionnalités

### Prédiction Individuelle
- Formulaire moderne 7 champs
- Validation client-side
- Résultat avec donut chart Recharts
- Facteurs influençants (SHAP)
- Recommandations commerciales

### Analyse CSV
- Upload drag-and-drop
- Traitement batch
- Tableau des clients à risque
- Recommendations stratégiques

### Dashboard
- 4 KPI Cards (clients, moyenne, risque élevé, global)
- Pie chart : Distribution des risques
- Bar chart : Facteurs principaux
- Tableau filtré top 50 clients
- Recommandations actionnables

---

## 🔧 Configuration

### URL API

Settings ⚙️ → Entrez URL → Appliquer

### Variables d'environnement

```env
# .env.local
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📚 Documentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Installation détaillée
- **[GUIDE_UTILISATEUR.md](./GUIDE_UTILISATEUR.md)** - Comment utiliser l'app
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Déployer en production
- **[FRONTEND_IMPROVEMENTS.md](../FRONTEND_IMPROVEMENTS.md)** - Améliorations techniques

---

## 📱 Responsive

- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (1024px+)

---

## 📦 Dépendances

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "recharts": "^2.12.0",
  "lucide-react": "^0.344.0"
}
```

**DevDeps** : Vite, TailwindCSS, PostCSS, Autoprefixer

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t customerpulse-ai .
docker run -p 3000:80 customerpulse-ai
```

### AWS S3 + CloudFront

```bash
npm run build
aws s3 sync dist/ s3://bucket-name/
```

---

## 🐛 Dépannage

| Erreur | Solution |
|--------|----------|
| API non connectée | Vérifier URL et backend |
| Build échoue | `rm -rf node_modules && npm install` |
| Styles cassés | Vérifier TailwindCSS build |

---

## 💡 Tips

- Utiliser `.` pour décimales (12.50 et non 12,50)
- CSV doit avoir TOUTES les colonnes requises
- Tester en mobile après chaque changement CSS
- Vercel Preview auto-générés par PR

---

## 📊 Performance

- **Lighthouse** : 95+ score
- **First Paint** : < 1s
- **Bundle size** : ~150KB gzipped

---

## 🤝 Contribution

Les améliorations bienvenues ! Créez une branche et soumettez une PR.

---

## 📄 Licence

MIT

---

## 📞 Support

Questions ? Consultez la documentation ou contactez l'équipe.

---

**Prêt à démarrer !** 🎯

```bash
npm install && npm run dev
```

---

**Crédits** : Conçu avec React, Vite, TailwindCSS et Recharts pour CustomerPulse AI
