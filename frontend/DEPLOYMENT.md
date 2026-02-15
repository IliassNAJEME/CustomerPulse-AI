# 🚀 Guide de Déploiement - CustomerPulse AI Frontend

## 📋 Options de déploiement

### Option 1 : Vercel (Recommandé ⭐)

**Avantages :**
- Déploiement en 1 clic
- Domaine gratuit
- HTTPS automatique
- Environment variables sécurisées
- Preview branches
- Analytics inclus

**Étapes :**

1. **Créer compte Vercel**
   - Allez sur https://vercel.com
   - Connectez-vous avec GitHub

2. **Déployer le projet**
   ```bash
   # Depuis le dossier frontend
   npm install -g vercel
   vercel
   ```
   - Acceptez les configurations par défaut
   - Votre app est en ligne ! 🎉

3. **Configurer l'API**
   - Dans Vercel Dashboard : Settings → Environment Variables
   - Ajoutez : `VITE_API_URL=https://votre-backend.com`
   - Mettez à jour `src/App.jsx` pour utiliser la variable

---

### Option 2 : AWS S3 + CloudFront

**Avantages :**
- Très bon marché
- CDN global
- Scalable
- Contrôle total

**Étapes :**

1. **Build l'app**
   ```bash
   npm run build
   ```

2. **Créer bucket S3**
   ```bash
   # Avec AWS CLI
   aws s3 mb s3://customerpulse-ai-frontend --region eu-west-1
   ```

3. **Déployer les fichiers**
   ```bash
   aws s3 sync dist/ s3://customerpulse-ai-frontend --delete
   ```

4. **Configurer CloudFront** (CDN)
   - Depuis AWS Console
   - Origin : votre bucket S3
   - Distribution créée

5. **Domaine personnalisé**
   - Route 53 : pointer vers CloudFront
   - SSL automatique via ACM

---

### Option 3 : Docker + Nginx

**Avantages :**
- Portabilité
- Contrôle complet
- Peut fonctionner anywhere

**Dockerfile :**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf :**

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Déployer :**

```bash
# Build l'image
docker build -t customerpulse-ai-frontend .

# Lancer localement
docker run -p 3000:80 customerpulse-ai-frontend

# Pousser vers registry (ex: Docker Hub)
docker tag customerpulse-ai-frontend username/customerpulse-ai-frontend
docker push username/customerpulse-ai-frontend
```

---

### Option 4 : GitHub Pages (Gratuit mais limité)

**Avantages :**
- Entièrement gratuit
- Déploiement automatique
- Idéal pour démo/prototype

**Limitation :** Chemin personnalisé uniquement (ex: `user.github.io/customerpulse-ai/`)

**Étapes :**

1. **Package.json**
   ```json
   {
     "homepage": "https://username.github.io/customerpulse-ai/",
     "base": "/customerpulse-ai/"
   }
   ```

2. **Build et déployer**
   ```bash
   npm run build
   git add dist
   git commit -m "Deploy"
   git push
   ```

3. **GitHub Settings**
   - Repository → Settings → Pages
   - Deploy from → github actions

---

## 🔒 Variables d'environnement

### En développement (`frontend/.env.local`)

```env
VITE_API_URL=http://127.0.0.1:8000
```

### En production

**Vercel:**
```
Dashboard → Settings → Environment Variables
VITE_API_URL=https://votre-api.com
```

**Docker:**
```bash
docker run -e VITE_API_URL=https://votre-api.com customerpulse-ai-frontend
```

---

## ✅ Checklist pré-déploiement

- [ ] Tests locaux OK : `npm run dev` fonctionne
- [ ] Build fonctionne : `npm run build` sans erreurs
- [ ] Aucune erreur console
- [ ] Responsive testé (mobile, tablet, desktop)
- [ ] API configurée correctement
- [ ] Pas de fichiers sensibles commitées
- [ ] package.json a les bonnes dépendances

---

## 🚀 Déploiement continu (CI/CD)

### GitHub Actions (Vercel Auto-Deploy)

Quand vous poussez sur `main`, Vercel déploie automatiquement :

```yaml
# .github/workflows/vercel.yml
name: Vercel Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### AWS CodePipeline

```yaml
# buildspec.yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
  build:
    commands:
      - cd frontend
      - npm ci
      - npm run build
  post_build:
    commands:
      - echo "Build completed"

artifacts:
  files:
    - '**/*'
  base-directory: frontend/dist
```

---

## 📊 Performance après déploiement

### Vérifier la performance

1. **Lighthouse**
   ```
   Chrome DevTools → Lighthouse → Analyze
   Viser : 90+ sur tous les scores
   ```

2. **Speed tests**
   - https://pagespeed.web.dev
   - https://gtmetrix.com
   - https://www.webpagetest.org

### Optimisations possibles

- Lazy loading des images
- Code splitting des routes
- Compression Gzip
- Cache headers
- Service Worker (PWA)

---

## 🔍 Monitoring en production

### Sentry (Error tracking)

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
});
```

### Datadog (Performance)

```javascript
// Track user events
const datadogRum = window.DD_RUM;
datadogRum.startSessionReplayRecording();
```

---

## 🎯 Post-déploiement

### Après le déploiement en prod :

1. **Smoke tests**
   - Testez chaque page
   - Testez chaque formulaire
   - Testez chaque API call

2. **Monitoring**
   - Erreurs ? → Sentry
   - Performance ? → Datadog
   - Utilisateurs ? → Google Analytics

3. **Feedback**
   - Collectez le feedback utilisateur
   - Fixez les bugs critiques ASAP
   - Préparez hotfixes

---

## 📞 Support déploiement

| Plateforme | Support |
|-----------|---------|
| Vercel | https://vercel.com/support |
| AWS | https://aws.amazon.com/support |
| Docker | https://docs.docker.com |
| GitHub Pages | https://docs.github.com/en/pages |

---

**Déploiement simple ! 🚀**

Vercel est recommandé pour la simplicité. Lancez `vercel` et c'est fait !
