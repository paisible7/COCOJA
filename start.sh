#!/bin/bash

# Script de démarrage rapide pour le développement
# Ce script vérifie la configuration et lance les serveurs

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage de AXIOM - Chat AI Application"
echo "=============================================="
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "📝 Création depuis .env.example..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
    echo "💡 Modifiez .env pour personnaliser la configuration"
    echo ""
fi

# Vérifier la base de données
if [ ! -f db.sqlite3 ]; then
    echo "📦 Base de données non trouvée"
    echo "🔧 Création de la base de données..."
    python manage.py migrate
    echo "✅ Base de données créée"
    echo ""
fi

# Demander si on veut créer un superuser
if [ ! -f .superuser_created ]; then
    echo "👤 Voulez-vous créer un compte administrateur ? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python manage.py createsuperuser
        touch .superuser_created
    fi
    echo ""
fi

# Vérifier les dépendances frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Dépendances frontend non installées"
    echo "🔧 Installation des dépendances..."
    cd frontend && npm install && cd ..
    echo "✅ Dépendances installées"
    echo ""
fi

echo "🎯 Configuration terminée !"
echo ""
echo "📊 État du système :"
echo "  - Backend: Django (Python)"
echo "  - Frontend: Vue.js + TypeScript"
echo "  - Modèle NLP: Mode simulation (à configurer)"
echo ""
echo "🌐 URLs :"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://127.0.0.1:8000/api"
echo "  - Admin Django: http://127.0.0.1:8000/admin"
echo ""
echo "📚 Documentation :"
echo "  - Guide d'intégration NLP: INTEGRATION_NLP.md"
echo "  - Résumé des corrections: CORRECTIONS_RESUME.md"
echo ""
echo "🔧 Pour intégrer votre modèle NLP :"
echo "  1. Éditez .env avec votre configuration"
echo "  2. Modifiez chat/nlp_model.py"
echo "  3. Consultez INTEGRATION_NLP.md"
echo ""
echo "🚀 Lancement des serveurs..."
echo ""

# Lancer les deux serveurs
./dev.sh
