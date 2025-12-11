# 🌍 TP7 - Gestion des Pollutions avec Authentification JWT

Ce monorepo contient une application full-stack de gestion des pollutions environnementales avec authentification JWT complète.

## ✨ Fonctionnalités principales

- 🔐 **Authentification JWT complète** (access token + refresh token)
- 👤 **Gestion des utilisateurs** avec rôles (user/admin)
- 🌡️ **CRUD Pollutions** avec protection par authentification
- ⭐ **Système de favoris** persistant
- 🛡️ **Guards de routes** et autorisation basée sur les rôles
- 🔄 **Refresh automatique** des tokens expirés
- 💾 **State management** avec NGXS
- 🎨 **Interface moderne** Angular 20

## Project Structure

```
tp4/
├── web/          # Angular frontend application
├── api/          # Backend API
├── .github/      # GitHub configuration
└── README.md     # This file
```

## Web (Angular Frontend)

The web application is an Angular project located in the `web/` directory.

### Démarrage rapide

Pour démarrer le serveur de développement :

```bash
cd web
bun install
bun run start
```

Ouvrez `http://localhost:4200/` dans votre navigateur.

### Build production

```bash
cd web
bun run build
```

Les fichiers de build seront dans `web/dist/`.

## API (Backend)

L'API REST est située dans le dossier `api/`.

### Configuration requise

1. **PostgreSQL** installé et en cours d'exécution
2. Créer un fichier `.env` dans `api/` (voir `.env.example`)
3. Configurer les secrets JWT et la base de données

**Exemple .env :**
```env
ACCESS_TOKEN_SECRET=<générer-un-secret-fort-64-caracteres>
REFRESH_TOKEN_SECRET=<générer-un-autre-secret-fort-64-caracteres>
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pollution_db
```

**Générer des secrets sécurisés :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Démarrage

```bash
cd api
bun install
bun run seed    # Créer des utilisateurs de test
bun run dev     # Démarrer le serveur
```

Le serveur démarre sur `http://localhost:3000`.

### Utilisateurs de test (après seed)

- **Admin:** `admin` / `admin123` (rôle: admin)
- **User:** `testuser` / `user123` (rôle: user)

---

## 🔐 Authentification JWT

### Architecture

Ce projet implémente une authentification JWT complète avec :

#### Backend (Node/Express)
- ✅ Génération et signature de tokens JWT
- ✅ Hachage sécurisé des mots de passe (bcrypt)
- ✅ Middleware `authenticateJWT` pour vérifier les tokens
- ✅ Middleware `authorizeRoles` pour les permissions
- ✅ Access token (15 min) + Refresh token (7 jours)
- ✅ Invalidation des refresh tokens au logout

#### Frontend (Angular + NGXS)
- ✅ State management NGXS pour l'authentification
- ✅ HTTP Interceptor pour injection automatique du token
- ✅ AuthGuard pour protéger les routes
- ✅ RoleGuard pour autorisation par rôle
- ✅ Refresh automatique des tokens expirés
- ✅ Persistance dans localStorage

### Routes de l'application

#### Routes publiques
- `/` - Accueil (redirige vers `/pollutions`)
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/pollutions` - Liste des pollutions (lecture seule)

#### Routes protégées (authentification requise)
- `/pollution/new` - Créer une pollution
- `/pollution/:id/edit` - Modifier une pollution
- `/users` - Liste des utilisateurs
- `/favorites` - Mes favoris

#### Routes admin (rôle admin requis)
- `/user/new` - Créer un utilisateur

### Endpoints API

#### Publics
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/pollutions` - Liste des pollutions

#### Privés (authentification requise)
- `GET /api/auth/me` - Utilisateur actuel
- `GET /api/users` - Liste des utilisateurs
- `POST /api/pollutions` - Créer une pollution
- `PUT /api/pollutions/:id` - Modifier une pollution
- `DELETE /api/pollutions/:id` - Supprimer une pollution

#### Admin uniquement
- `POST /api/users` - Créer un utilisateur

### Test rapide

```bash
# 1. Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'

# 2. Utiliser le token (remplacer YOUR_TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation complète

- **[QUICKSTART.md](./QUICKSTART.md)** - Guide de démarrage rapide
- **[AUTH_README.md](./AUTH_README.md)** - Documentation complète de l'authentification
- **[API_TESTS.md](./API_TESTS.md)** - Collection de tests API (Postman/cURL)
- **[SECURITY.md](./SECURITY.md)** - Guide de sécurité et bonnes pratiques

---

## Docker Deployment

This project includes separate Docker images for the web frontend and API backend.

### Building Individual Images

**Build Web Frontend:**
```bash
cd web
docker build -t tp4-web .
docker run -p 80:80 tp4-web
```

**Build API Backend:**
```bash
cd api
docker build -t tp4-api .
docker run -p 3000:3000 tp4-api
```

### Using Docker Compose (Recommended)

To run both services together:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This will start:
- Web frontend on `http://localhost:80`
- API backend on `http://localhost:3000`

### Docker Images

- **tp4-web**: Nginx-based image serving the Angular application (production build)
- **tp4-api**: Bun-based image running the Express API server

## 🛠️ Technologies utilisées

### Frontend
- Angular 20
- TypeScript
- NGXS (State Management)
- RxJS
- Reactive Forms

### Backend
- Node.js / Bun
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT (jsonwebtoken)
- bcrypt

---

## ⚠️ Important - Production

Avant de déployer en production :

1. ✅ Changez tous les mots de passe par défaut
2. ✅ Générez de nouveaux secrets JWT forts (64+ caractères)
3. ✅ Activez HTTPS
4. ✅ Configurez CORS correctement
5. ✅ Ajoutez du rate limiting
6. ✅ Activez les logs de sécurité

Consultez [SECURITY.md](./SECURITY.md) pour plus de détails.

---

## 📄 Licence

Projet académique - CNAM

---

## 🎉 Commencer maintenant !

```bash
# 1. Backend
cd api
bun install
cp .env.example .env  # Puis éditer .env
bun run seed
bun run dev

# 2. Frontend (nouveau terminal)
cd web
bun install
bun run start

# 3. Ouvrir http://localhost:4200
# 4. Se connecter avec admin / admin123
```

---

## Ressources additionnelles

- [Angular Documentation](https://angular.dev)
- [NGXS Documentation](https://www.ngxs.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
