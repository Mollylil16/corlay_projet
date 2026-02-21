# Backend Corlay / FuelDispatch (NestJS + PostgreSQL)

API REST pour la gestion de distribution de carburant. Base de données **PostgreSQL** (créée dans pgAdmin : `corlay_db`).

## Prérequis

- Node.js 18+
- PostgreSQL (avec la base `corlay_db` créée dans pgAdmin)
- npm ou yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Créez un fichier `.env` à la racine du dossier `backend` :

```env
# Connexion PostgreSQL (remplacez VOTRE_MOT_DE_PASSE par le mot de passe postgres)
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/corlay_db"

# JWT (à changer en production)
JWT_SECRET="corlay-dev-secret"

# Port de l'API
PORT=3001
```

## Base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables dans PostgreSQL (corlay_db)
npm run db:push

# Remplir avec les données de démo (utilisateurs, commandes, véhicules, etc.)
npm run db:seed
```

Comptes de démo après le seed :

- **Admin** : `admin@corlay.ci` / `admin123`
- **Dispatcher** : `dispatcher@corlay.ci` / `dispatch123`

## Lancer l'API

```bash
# Mode développement (rechargement auto)
npm run start:dev

# Mode production
npm run build
npm run start
```

L’API est disponible sur **http://localhost:3001**.

## Endpoints principaux

| Méthode | Route | Description |
|--------|--------|-------------|
| POST | `/auth/login` | Connexion (email, password) → token JWT |
| GET | `/users` | Liste des utilisateurs (JWT) |
| GET | `/commandes` | Liste des commandes |
| GET | `/vehicles` | Liste des véhicules (suivi) |
| GET | `/depots` | Dépôts et cuves (stocks) |
| GET | `/transporteurs` | Liste des transporteurs |
| GET | `/bons-livraison` | Bons de livraison |
| GET | `/alertes` | Alertes |

Les routes (sauf `/auth/login`) nécessitent le header :  
`Authorization: Bearer <token>`.

## Structure du projet (NestJS)

```
src/
├── main.ts
├── app.module.ts
├── prisma/           # PrismaService (connexion DB)
├── auth/             # Login, JWT, Guard
├── users/
├── commandes/
├── vehicles/
├── depots/
├── transporteurs/
├── bons-livraison/
└── alertes/
```

Chaque module contient : `*.module.ts`, `*.controller.ts`, `*.service.ts`, et éventuellement `dto/`.
