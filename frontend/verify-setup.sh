#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      🎯 CustomerPulse AI - Frontend Setup Verification        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (NOT FOUND)"
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ (NOT FOUND)"
    fi
}

echo -e "${BLUE}Vérification des fichiers de configuration${NC}"
echo "─────────────────────────────────────────────────"
check_file "package.json"
check_file "vite.config.js"
check_file "tailwind.config.js"
check_file "postcss.config.js"
check_file "index.html"
echo ""

echo -e "${BLUE}Vérification des fichiers source${NC}"
echo "─────────────────────────────────────────────────"
check_dir "src"
check_file "src/main.jsx"
check_file "src/App.jsx"
check_file "src/index.css"
echo ""

echo -e "${BLUE}Vérification des composants${NC}"
echo "─────────────────────────────────────────────────"
check_dir "src/components"
check_file "src/components/Header.jsx"
check_file "src/components/APISettings.jsx"
check_file "src/components/SinglePredictionForm.jsx"
check_file "src/components/PredictionResult.jsx"
check_file "src/components/CSVUploadForm.jsx"
check_file "src/components/CSVDashboard.jsx"
check_file "src/components/EmptyState.jsx"
echo ""

echo -e "${BLUE}Vérification de la documentation${NC}"
echo "─────────────────────────────────────────────────"
check_file "README.md"
check_file "INSTALLATION.md"
check_file "GUIDE_UTILISATEUR.md"
check_file "DEPLOYMENT.md"
check_file "CHANGES_SUMMARY.txt"
echo ""

echo -e "${BLUE}Vérification des dépendances${NC}"
echo "─────────────────────────────────────────────────"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm not found"
fi

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules/ (installed)"
else
    echo -e "${YELLOW}!${NC} node_modules/ (not installed yet)"
    echo "  → Run: npm install"
fi
echo ""

echo -e "${BLUE}Prochaines étapes${NC}"
echo "─────────────────────────────────────────────────"
echo "1. npm install              (si node_modules absent)"
echo "2. npm run dev              (démarrer développement)"
echo "3. Ouvrir http://localhost:5173"
echo "4. Lire GUIDE_UTILISATEUR.md"
echo ""

echo "✅ Vérification terminée!"
echo ""
