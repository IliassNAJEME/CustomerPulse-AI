# 🚀 Installation et Configuration - CustomerPulse AI Frontend

## 📋 Structure des fichiers modifiés/créés

### Fichiers modifiés :
```
frontend/
├── package.json                              ✅ Dépendances mises à jour
├── src/
│   ├── App.jsx                              ✅ App complètement refondue
│   └── index.css                            ✅ Système de design CSS refondu
```

### Fichiers créés (composants) :
```
frontend/src/components/
├── Header.jsx                               ✨ En-tête SaaS professionnelle
├── APISettings.jsx                          ✨ Configuration et test de l'API
├── SinglePredictionForm.jsx                 ✨ Formulaire prédiction individuelle
├── PredictionResult.jsx                     ✨ Affichage résultats avec charts
├── CSVUploadForm.jsx                        ✨ Upload drag-and-drop CSV
└── CSVDashboard.jsx                         ✨ Dashboard décisionnel complet
```

---

## 🛠️ Installation

### Étape 1 : Installer les dépendances

```bash
cd frontend
npm install
```

**Dépendances ajoutées :**
- `recharts@^2.12.0` - Charts et visualisations data
- `lucide-react@^0.344.0` - Icons professionnels

### Étape 2 : Lancer le développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173`

### Étape 3 : Build production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

---

## ✨ Nouvelles fonctionnalités

### 1️⃣ **Interface SaaS Moderne**
- Design système cohérent avec Tailwind CSS
- Palette de couleurs professionnelle (Bleu, Cyan, Slate)
- Typographie optimisée avec Inter

### 2️⃣ **Prédiction Individuelle**
- Formulaire moderne et responsive
- Validation client-side
- Affichage visuel du risque avec donut chart
- Interprétation intelligente du risque
- Facteurs principaux avec SHAP values
- Recommandations commerciales

### 3️⃣ **Analyse CSV (Batch)**
- Upload drag-and-drop
- Traitement en temps réel
- Statistiques complètes

### 4️⃣ **Dashboard Décisionnel**
- **KPI Cards** : 4 métriques clés
- **Charts Recharts** : Distribution des risques, facteurs principaux
- **Tableau interactif** : Top 50 clients à risque
- **Recommandations** : Actions stratégiques basées sur les insights
- **Responsive** : Adapté mobile, tablet, desktop

### 5️⃣ **Configuration API Avancée**
- Test de connexion automatique
- Indicateur d'état visuel
- URL personnalisable

---

## 🎨 Design System

### Couleurs
- **Primaire** : Bleu (#2563eb) & Cyan (#06b6d4)
- **Succès** : Émeraude (#10b981)
- **Alerte** : Ambre (#f59e0b)
- **Danger** : Rouge (#ef4444)
- **Neutre** : Slate (gris)

### Composants réutilisables
- `.btn` - Boutons (primary, secondary, ghost)
- `.card` - Cartes avec ombre subtile
- `.badge` - Badges (success, warning, danger, info)
- `.alert` - Alertes (success, warning, danger, info)
- `.input` - Champs de saisie stylisés
- `.field` - Labels + inputs groupés
- `.table` - Tables responsive

---

## 📱 Responsivité

✅ **Mobile-first** : Tous les composants adaptatifs
- SM (640px) : 2 colonnes
- MD (768px) : 3 colonnes  
- LG (1024px) : Full desktop

---

## 🔧 Personnalisation

### Changer les couleurs
Éditer `/src/index.css` et les classes Tailwind dans les composants

### Ajouter des champs au formulaire
Modifier `FORM_FIELDS` dans `/src/components/SinglePredictionForm.jsx`

### Ajouter des charts
Utiliser `recharts` - voir `/src/components/CSVDashboard.jsx` pour les exemples

---

## 📊 Aperçu de l'app

```
┌─────────────────────────────────────────────────┐
│ 📊 CustomerPulse AI                   [Settings] │  <- Header
├─────────────────────────────────────────────────┤
│                                                   │
│  API Configuration    [✓ Connecté]              │  <- API Settings
│                                                   │
├─────────────────────────────────────────────────┤
│                         │                         │
│  Prédiction            │    Upload CSV           │  <- Formulaires
│  Individuelle          │                         │
│                         │                         │
├─────────────────────────────────────────────────┤
│                                                   │
│  Résultat              │   Résultats CSV         │  <- Résultats
│  + Chart               │   + Dashboard           │
│                         │                         │
└─────────────────────────────────────────────────┘
```

---

## 🚨 Dépannage

### L'API ne se connecte pas
1. Vérifier l'URL : `http://127.0.0.1:8000`
2. Vérifier que le backend est démarré
3. Utiliser le bouton "Test connexion" dans Settings

### Les charts ne s'affichent pas
1. Vérifier que `recharts` est installé : `npm list recharts`
2. Redémarrer le serveur dev : `npm run dev`

### Erreur de validation des nombres
- Format : Utiliser `.` pour les décimales (12.50 et non 12,50)

---

## 📝 Notes

- L'interface est entièrement en **français**
- Compatible avec le backend Python FastAPI existant
- Tous les fichiers `.jsx` utilisent **ES6+ avec Hooks**
- Pas de dépendances lourdes (React, Tailwind, Recharts seulement)

---

**Prêt à démarrer !** 🎉
```bash
cd frontend && npm install && npm run dev
```
