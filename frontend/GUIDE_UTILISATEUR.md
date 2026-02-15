# 👥 Guide Utilisateur - CustomerPulse AI

## 🎯 Qu'est-ce que CustomerPulse AI ?

Une plateforme intelligente qui **prédit le risque de churn (résiliation) de vos clients** en utilisant l'IA. Analysez un client à la fois ou importez des centaines de clients pour une analyse en masse.

---

## 🚀 Démarrage rapide

### 1. Démarrer l'application

```bash
cd frontend
npm install      # Une seule fois
npm run dev
```

L'app s'ouvre sur `http://localhost:5173`

### 2. Configurer l'API

1. Cliquez sur ⚙️ **Settings** en haut à droite
2. Entrez l'URL du backend : `http://127.0.0.1:8000`
3. Cliquez **Appliquer**
4. Attendez le statut ✓ **Connecté**

---

## 📋 Fonctionnalités principales

### ⚡ Prédiction Individuelle (Colonne gauche)

Analysez le risque de churn d'un seul client :

**Étapes :**
1. Remplissez les 7 champs du formulaire
2. Cliquez **Analyser le client**
3. Consultez les résultats

**Informations affichées :**
- 📊 **Donut chart** : Visualisé en % (exemple : 35% de risque)
- 🏷️ **Badge du niveau** : FAIBLE ✓ / MOYEN ! / ÉLEVÉ ⚠
- 📈 **Barre de progression** : Indication visuelle du risque
- 🔍 **Top 5 facteurs** : Quels éléments influencent le risque ?
  - ✅ Réduisent le risque
  - ❌ Augmentent le risque
- 💡 **Recommandations** : Actions commerciales suggérées

**Exemple de résultat :**
```
Risque de résiliation : 65%
Niveau : ÉLEVÉ ⚠

Facteurs principaux :
1. Contrat mensuel → Augmente le risque (+0.234)
2. Ancienneté courte → Augmente le risque (+0.156)
3. Frais mensuels élevés → Réduit le risque (-0.089)
```

---

### 📤 Analyse CSV (Colonne droite)

Prédisez le risque pour **plusieurs clients en une seule analyse** :

**Étapes :**
1. Préparez un fichier CSV avec les colonnes requises
2. **Drag & drop** le fichier sur la zone grise
   OU cliquez **Parcourir les fichiers**
3. L'analyse se lance automatiquement
4. Consultez le dashboard décisionnel

**Format du CSV :**
```csv
Age,Gender,Tenure,MonthlyCharges,Contract,PaymentMethod,TotalCharges
45,Female,10,70.5,Month-to-month,Electronic check,705.0
52,Male,24,89.99,One year,Bank transfer,2159.76
```

**Colonnes requises :**
- `Age` : Âge du client (nombre)
- `Gender` : Genre (Female/Male)
- `Tenure` : Ancienneté en mois (nombre)
- `MonthlyCharges` : Frais mensuels en € (nombre)
- `Contract` : Type de contrat (Month-to-month/One year/Two year)
- `PaymentMethod` : Mode de paiement (Electronic check/Bank transfer/etc)
- `TotalCharges` : Total facturé en € (nombre)

---

## 📊 Dashboard Décisionnel

Après une analyse CSV, un dashboard complet s'affiche :

### 1️⃣ Métriques clés (4 cards)

| Métrique | Meaning |
|----------|---------|
| **Clients analysés** | Nombre total de lignes du CSV |
| **Probabilité moyenne** | % moyen de risque pour tous les clients |
| **Clients à haut risque** | Nombre et % clients avec risque > 70% |
| **Risque global** | FAIBLE/MOYEN/ÉLEVÉ pour toute la base |

### 2️⃣ Graphiques

**Distribution des risques (Pie Chart)**
- Proportion de clients par catégorie
- Visuellement : 🟢 Faible / 🟡 Moyen / 🔴 Élevé

**Facteurs principaux (Bar Chart)**
- Top 5 variables qui influencent le churn
- Exemple : "Contrat mensuel" est le facteur #1

### 3️⃣ Recommandations stratégiques

Actions concrètes basées sur l'analyse :
```
• Cibler les clients en contrat mensuel avec une offre long-terme
• Augmenter la satisfaction des nouveaux clients (< 6 mois)
• Analyser la qualité du service paiement électronique
```

### 4️⃣ Tableau des clients à risque

Les 50 clients avec le risque **le plus élevé** :
- ID Client
- Risque (%)
- Niveau (FAIBLE/MOYEN/ÉLEVÉ)
- Contrat
- Ancienneté
- Frais mensuels

Utilisez ce tableau pour :
✅ Prioriser vos appels de retention  
✅ Identifier les patterns communs  
✅ Tester des offres de fidélisation

---

## 🎨 Comprendre les visuels

### Donut Chart
```
Exemple : 65% de risque

        [Bleu] 65%
        [Gris] 35%

"Ce client a 65% de chance de résilier"
```

### Badge de risque
```
🟢 FAIBLE      : < 30% → ✓ Client stable
🟡 MOYEN       : 30-70% → ! Attention requise
🔴 ÉLEVÉ       : > 70% → ⚠ Action immédiate
```

### Facteurs avec flèches
```
✅ Réduit le risque (flèche down)
❌ Augmente le risque (flèche up)
```

---

## 💡 Cas d'usage

### Cas 1 : Retention d'un client important

```
Vous avez un client VIP avec 65% de risque de churn.

1. Allez à "Prédiction Individuelle"
2. Entrez ses données
3. Lisez les facteurs → contrat mensuel est le problème
4. Action : Proposez un contrat 1-2 ans avec réduction
```

### Cas 2 : Campagne de fidélisation

```
Vous avez une base de 5000 clients.

1. Exportez les données en CSV
2. Importez dans "Analyse CSV"
3. Consultez le Dashboard → 1200 clients à risque
4. Action : Campagne d'emailing personnalisée

Personnes à contacter en priorité :
- Les 300 clients à risque ÉLEVÉ (rouge)
```

### Cas 3 : Identifier les patterns

```
Dashboard montre que les clients en contrat mensuel
churnent 2x plus que les clients en 1-2 ans.

Actions :
- Revoir la stratégie commerciale des contrats
- Former les vendeurs à proposer des contrats plus longs
- Créer des incitations pour la conversion annuelle
```

---

## ⚙️ Paramètres & configuration

### Changer l'URL de l'API

```
1. Cliquez ⚙️ Settings (en haut à gauche)
2. Modifiez l'URL
3. Cliquez "Appliquer"
4. Attendez la confirmation ✓
```

### Erreurs courantes

| Message | Solution |
|---------|----------|
| "Erreur de connexion" | Backend n'est pas démarré |
| "Le champ Age doit être un nombre" | Entrez un nombre valide (ex: 45) |
| "Chèque électronique" au lieu de "Electronic check" | Utiliser les labels en français dans l'UI |
| CSV ne charge pas | Vérifier que toutes les colonnes existent |

---

## 📱 Vue mobile vs desktop

**Desktop (1920px)** : 2 colonnes côte à côte
```
┌─────────────────┬─────────────────┐
│  Prédiction     │  CSV Upload     │
│  Individuelle   │  & Dashboard    │
└─────────────────┴─────────────────┘
```

**Tablette (768px)** : 2 colonnes empilées
```
┌───────────────────┐
│  Prédiction       │
│  Individuelle     │
├───────────────────┤
│  CSV Upload       │
│  & Dashboard      │
└───────────────────┘
```

**Mobile (320px)** : 1 colonne
```
┌───────────────────┐
│  Prédiction       │
│  Individuelle     │
├───────────────────┤
│  CSV Upload       │
└───────────────────┘
```

---

## 🔒 Sécurité & Confidentialité

- ✅ Pas de sauvegarde des données sur le serveur frontend
- ✅ Vos fichiers CSV sont traités en temps réel et oubliés
- ✅ Communication directe avec votre backend
- ✅ Tout reste sur vos serveurs

---

## 🎓 Conseils d'expert

1. **Qualité des données** : Plus les données sont complètes, meilleures sont les prédictions
2. **Réserve de base** : Une analyse sur 50 clients est moins fiable que sur 500
3. **Réitération** : Réanalysez régulièrement pour tracker la progression
4. **Actions** : Ne pas oublier d'agir après l'analyse ! C'est là que la vraie valeur se crée
5. **Feedback** : Notez si les prédictions étaient correctes pour améliorer le modèle

---

## 📞 Support

Si vous rencontrez un problème :

1. Vérifiez que le backend est démarré
2. Testez la connexion avec ⚙️ Settings
3. Consultez "Dépannage" dans le guide technique

---

**Bonne prédiction ! 🎯**
