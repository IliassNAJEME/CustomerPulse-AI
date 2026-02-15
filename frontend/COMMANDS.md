# 📝 Commandes essentielles - CustomerPulse AI

## 🚀 Développement

### Installer les dépendances
```bash
npm install
```
Crée `node_modules/` avec toutes les dépendances. À faire une seule fois.

### Démarrer le serveur de développement
```bash
npm run dev
```
- Démarre sur http://localhost:5173
- Hot Module Replacement (HMR) activé
- Rechargement auto en temps réel

### Arrêter le serveur
```bash
Ctrl + C
```

---

## 🏗️ Build et Preview

### Créer une build production
```bash
npm run build
```
- Minifiée et optimisée
- Dossier `dist/` créé
- Prêt pour déploiement

### Prévisualiser la build localement
```bash
npm run preview
```
- Simule l'environnement production
- Sur http://localhost:5173

---

## 🧹 Nettoyage

### Supprimer node_modules et relancer
```bash
rm -rf node_modules
npm install
```
Utile si erreurs bizarres ou après merge git.

### Vider cache npm
```bash
npm cache clean --force
```
Pour forcer le téléchargement des dépendances.

### Nettoyer le cache Vite
```bash
rm -rf .vite
```

---

## 📦 Dépendances

### Lister les dépendances installées
```bash
npm list
npm list --depth=0        # Seulement niveau 1
```

### Ajouter une dépendance
```bash
npm install nom-du-package
npm install --save-dev nom-du-package    # Pour dev uniquement
```

### Supprimer une dépendance
```bash
npm uninstall nom-du-package
```

### Vérifier les mises à jour disponibles
```bash
npm outdated
```

### Mettre à jour les dépendances
```bash
npm update
```

---

## 🔍 Debug et Vérification

### Vérifier l'installation
```bash
npm list react react-dom tailwindcss vite recharts lucide-react
```

### Vérifier les problèmes
```bash
npm audit
```
Trouve les vulnérabilités de sécurité.

### Fixer automatiquement les problèmes
```bash
npm audit fix
```

---

## 🚀 Déploiement

### Déployer sur Vercel
```bash
npm install -g vercel
vercel
```

### Déployer sur GitHub Pages
```bash
npm run build
git add dist
git commit -m "Deploy"
git push origin main
```

### Créer une image Docker
```bash
docker build -t customerpulse-ai-frontend .
docker run -p 3000:80 customerpulse-ai-frontend
```

---

## 🔧 Configuration

### Changer le port de développement
Éditer `vite.config.js` :
```javascript
server: {
  port: 3000  // au lieu de 5173
}
```

### Changer l'URL API
Éditer `.env.local` :
```env
VITE_API_URL=https://api.example.com
```

---

## 📊 Analyse

### Analyser la taille du build
```bash
npm run build -- --analyze
```

### Vérifier la performance avec Lighthouse
1. Ouvrir `npm run dev`
2. Chrome → DevTools (F12)
3. Lighthouse → Analyze

---

## 🐛 Troubleshooting des commandes

### Si `npm install` échoue
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Si `npm run dev` échoue
```bash
# Vérifier que le port 5173 n'est pas utilisé
lsof -i :5173

# Ou utiliser un autre port
npm run dev -- --port 3000
```

### Si `npm run build` échoue
```bash
# Vérifier les erreurs
npm run build 2>&1 | more

# Vérifier le disque
df -h
```

---

## 📝 Alias utiles

Ajouter à `.bashrc` ou `.zshrc` :

```bash
alias npm-dev="npm run dev"
alias npm-build="npm run build"
alias npm-preview="npm run preview"
alias npm-clean="rm -rf node_modules package-lock.json && npm install"
```

Utiliser ensuite :
```bash
npm-dev        # au lieu de npm run dev
npm-build      # au lieu de npm run build
```

---

## 🎯 Workflow typique

```bash
# 1. Cloner et installer
git clone <repo>
cd frontend
npm install

# 2. Développer
npm run dev
# (faire des modifications)
# (fichiers sauvegardés auto-rechargés)

# 3. Tester
# (ouvrir Chrome DevTools - F12)
# (vérifier la console pour erreurs)

# 4. Commit et push
git add .
git commit -m "Feature description"
git push origin main

# 5. Build et déployer
npm run build
npm run preview        # tester localement
vercel                 # déployer

# 6. Vérifier en production
# (ouvrir votre-domaine.com)
# (vérifier que tout fonctionne)
```

---

## 🔗 Ressources utiles

- **npm docs** : https://docs.npmjs.com
- **Vite docs** : https://vitejs.dev
- **Tailwind docs** : https://tailwindcss.com
- **Recharts docs** : https://recharts.org
- **React docs** : https://react.dev

---

## 💡 Tips

✅ **Garder à jour** : `npm update` régulièrement  
✅ **Vérifier avant commit** : `npm audit` toujours  
✅ **Lire les erreurs** : Messages souvent explicites  
✅ **Google est votre ami** : Copier l'erreur dans Google  
✅ **Documentation** : Consulter les docs officielles d'abord  

---

**Prêt ? Commencez par :**
```bash
cd frontend && npm install && npm run dev
```

Bonne luck ! 🚀
