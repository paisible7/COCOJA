# AXIOM - Chat Application with AI

Application de chat avec intelligence artificielle utilisant Django REST Framework pour le backend et Vue.js 3 pour le frontend.

## 🚀 Stack Technologique

### Backend
- **Django 4.2.27** - Framework web Python
- **Django REST Framework** - API REST
- **SimpleJWT** - Authentification JWT
- **SQLite** - Base de données

### Frontend
- **Vue 3.5** - Framework JavaScript progressif
- **TypeScript** - Typage statique
- **Vite 7** - Build tool ultra-rapide
- **Pinia** - State management
- **Tailwind CSS 4** - Framework CSS utility-first
- **Axios** - Client HTTP
- **Iconify** - Bibliothèque d'icônes

## 📁 Structure du Projet

```
axiom/
├── manage.py                 # Django management
├── db.sqlite3               # Base de données
├── dev.sh                   # Script pour lancer les 2 serveurs
├── axiom/                   # Configuration Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── chat/                    # Application Django Chat
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
└── frontend/                # Application Vue.js
    ├── src/
    │   ├── components/      # Composants Vue
    │   ├── stores/          # Stores Pinia
    │   ├── services/        # Services API
    │   ├── types/           # Types TypeScript
    │   └── utils/           # Utilitaires
    ├── package.json
    └── vite.config.ts
```

## 🛠️ Installation

### Prérequis
- Python 3.8+
- Node.js 20+
- npm ou pnpm

### Backend (Django)

```bash
cd axiom

# Installer les dépendances Python
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# Appliquer les migrations
python3 manage.py migrate

# Créer un superutilisateur (optionnel)
python3 manage.py createsuperuser
```

### Frontend (Vue.js)

```bash
cd frontend

# Installer les dépendances
npm install
```

## 🚀 Démarrage

### Option 1: Lancer les deux serveurs ensemble (Recommandé)

```bash
# Depuis le dossier axiom/
./dev.sh
```

ou depuis le dossier frontend:

```bash
npm run dev:all
```

Cette commande lance :
- **Django** sur `http://127.0.0.1:8000`
- **Vite** sur `http://localhost:5173`

### Option 2: Lancer séparément

**Terminal 1 - Django:**
```bash
cd axiom
python3 manage.py runserver
```

**Terminal 2 - Vue.js:**
```bash
cd axiom/frontend
npm run dev
```

## 📡 API Endpoints

### Chat API

- **POST** `/api/chat/ask/`
  - Body: `{ "question": "Votre question" }`
  - Response: `{ "answer": "Réponse du modèle" }`

### Auth API

- **GET** `/api/auth/csrf/`
- **POST** `/api/auth/register/`
- **POST** `/api/auth/login/`
- **POST** `/api/auth/logout/`
- **GET** `/api/auth/me/`
- **POST** `/api/auth/jwt/create/`
- **POST** `/api/auth/jwt/refresh/`
- **POST** `/api/auth/jwt/verify/`

## 🎨 Fonctionnalités

### Frontend
- ✅ Interface de chat moderne en mode sombre
- ✅ Gestion de multiples conversations
- ✅ Historique des conversations (groupé par date)
- ✅ Indicateur de frappe
- ✅ Stockage local (localStorage)
- ✅ Responsive design
- ✅ Animations fluides
- ✅ Icônes Lucide via Iconify

### Backend
- ✅ API REST avec Django REST Framework
- ✅ CORS configuré pour le développement
- ✅ Endpoint de chat configuré
- ⏳ Intégration d'un modèle NLP (à venir)

## 🔧 Configuration

### Proxy Vite
Le frontend est configuré pour proxyfier les requêtes `/api` vers Django:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}
```

### CORS Django
Les requêtes cross-origin sont autorisées en développement:

```python
# settings.py
CORS_ALLOW_ALL_ORIGINS = True  # À sécuriser en production
```

## 📝 Scripts Disponibles

```bash
# Frontend
npm run dev          # Démarrer Vite
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run type-check   # Vérifier les types TypeScript
npm run lint         # Linter le code
npm run dev:all      # Lancer Django + Vite ensemble

# Backend
python3 manage.py runserver        # Démarrer Django
python3 manage.py migrate          # Appliquer les migrations
python3 manage.py makemigrations   # Créer les migrations
python3 manage.py createsuperuser  # Créer un admin
```

## 🚧 Prochaines Étapes

- [ ] Intégrer un modèle NLP réel dans la vue `ask_model`
- [ ] Créer des modèles de données pour persister les conversations
- [ ] Ajouter l'authentification utilisateur
- [ ] Implémenter la recherche dans l'historique
- [ ] Ajouter le support du markdown dans les messages
- [ ] Déploiement en production
- [ ] Tests unitaires et E2E

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

Développé avec ❤️ pour l'apprentissage du NLP et des applications de chat IA.
