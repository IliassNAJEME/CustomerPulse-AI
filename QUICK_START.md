# ⚡ Démarrage rapide - CustomerPulse AI Frontend

> **5 minutes pour avoir l'app en local** ⏱️

---

## 🎯 Objectif

Transformer votre frontend en interface SaaS ultra-professionnelle.
**✅ Déjà fait !** Il faut juste l'exécuter.

---

## 🚀 Les 5 étapes (5 minutes)

### Étape 1 : Aller dans le dossier frontend
```bash
cd frontend
```

### Étape 2 : Installer les dépendances (2 min)
```bash
npm install
```

Cela va télécharger :
- React, React DOM
- Tailwind CSS, PostCSS
- Vite (bundler)
- Recharts (charts)
- Lucide React (icons)

### Étape 3 : Démarrer le serveur (10 sec)
```bash
npm run dev
```

Vous verrez :
```
  VITE v5.4.8  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Étape 4 : Ouvrir dans le navigateur
Cliquez ou ouvrez : **http://localhost:5173**

### Étape 5 : Profiter ! 🎉
- L'app est chargée
- Elle est responsibe (testez sur mobile)
- Tout fonctionne en développement

---

## ✅ Vérifications rapides

### ✓ Frontend se lance
```
http://localhost:5173 doit afficher l'app
```

### ✓ Configuration API
1. Cliquez sur ⚙️ Settings (en haut à gauche)
2. Vérifiez l'URL : `http://127.0.0.1:8000`
3. Cliquez "Appliquer"
4. Attendez ✓ Connecté

### ✓ Backend est démarré
L'API doit être lancée avant de tester les prédictions.
```bash
# Depuis la racine du projet
python src/main.py
# Ou avec Uvicorn
uvicorn src.api:app --reload
```

### ✓ Prédiction fonctionne
1. Remplissez le formulaire (champs déjà pré-remplis)
2. Cliquez "Analyser le client"
3. Vous voyez le résultat avec donut chart

### ✓ CSV fonctionne
1. Préparez un CSV avec les colonnes requises
2. Drag-drop sur la zone grise
3. Dashboard s'affiche avec KPI

---

## 📁 Fichiers importants

| Fichier | Utilité |
|---------|---------|
| `src/App.jsx` | App principale |
| `src/components/` | 7 composants réutilisables |
| `src/index.css` | Styles globaux |
| `vite.config.js` | Config Vite |
| `tailwind.config.js` | Config Tailwind |

---

## 🔧 Commandes principales

```bash
npm run dev       # Démarrer (http://localhost:5173)
npm run build     # Créer version production
npm run preview   # Prévisualiser la build
npm install       # Installer dépendances
```

---

## 📚 Documentation

Après le démarrage, consultez :

1. **README.md** - Aperçu général
2. **GUIDE_UTILISATEUR.md** - Comment utiliser
3. **INSTALLATION.md** - Details installation
4. **DEPLOYMENT.md** - Déployer en production

---

## 💡 Premiers pas après démarrage

### A. Testez prédiction individuelle
```
1. Formulaire est pré-rempli (Age: 45, etc)
2. Cliquez "Analyser le client"
3. Vous verrez:
   - Risque en % (ex: 65%)
   - Donut chart
   - Facteurs influençants
   - Recommandations
```

### B. Testez CSV
```
1. Créez un fichier test.csv:
   Age,Gender,Tenure,MonthlyCharges,Contract,PaymentMethod,TotalCharges
   45,Female,10,70.5,Month-to-month,Electronic check,705.0
   52,Male,24,89.99,One year,Bank transfer,2159.76

2. Drag-drop sur zone grise
3. Dashboard s'affiche avec:
   - 4 KPI cards
   - 2 charts (pie + bar)
   - Tableau top 50 clients
```

### C. Explorez le design
```
- Ouvrez Chrome DevTools (F12)
- Testez en mobile (Ctrl+Shift+M)
- Jouez avec les couleurs dans index.css
- Ajoutez des champs au formulaire
```

---

## 🐛 Erreurs courantes

### ❌ Port 5173 déjà utilisé
```bash
# Utiliser un autre port
npm run dev -- --port 3000
```

### ❌ API non trouvée
```
Vérifier que le backend est démarré
Settings → Tester l'URL API
```

### ❌ npm install échoue
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Styles cassés
```bash
npm run build
# Vérifier que Tailwind build correctement
```

---

## 🎯 Structure de l'app

```
App
├─ Header
├─ APISettings (configuration)
├─ SinglePredictionForm (formulaire)
│  └─ PredictionResult (résultats)
└─ CSVUploadForm (upload)
   └─ CSVDashboard (dashboard)
```

---

## 🚀 Prochaines étapes (après test local)

### Pour tester en production-like
```bash
npm run build
npm run preview
# Ouvre http://localhost:4173
```

### Pour déployer
```bash
# Option 1: Vercel (Recommandé)
vercel

# Option 2: AWS S3
npm run build && aws s3 sync dist/ s3://bucket/

# Option 3: Docker
docker build -t app . && docker run -p 3000:80 app
```

**Voir DEPLOYMENT.md pour détails**

---

## 📞 Aide rapide

| Besoin | Fichier |
|--------|---------|
| Installer | INSTALLATION.md |
| Utiliser | GUIDE_UTILISATEUR.md |
| Déployer | DEPLOYMENT.md |
| Commandes | COMMANDS.md |
| Détails techs | FRONTEND_IMPROVEMENTS.md |

---

## ✨ Points clés

✅ **100% Français** - Interface entièrement localisée  
✅ **Responsive** - Mobile, tablet, desktop  
✅ **Moderne** - Design SaaS professionnel  
✅ **Rapide** - Vite + TailwindCSS  
✅ **Léger** - 3 dépendances seulement  
✅ **Documenté** - 8 fichiers de doc  

---

## 🎉 Vous êtes prêt !

```bash
cd frontend && npm install && npm run dev
```

**Bon développement ! 🚀**

---

**Durée estimée** :
- Installation : 2-3 minutes
- Premier test : 30 secondes
- Total : ~5 minutes

**Status** : ✅ Prêt à déployer
