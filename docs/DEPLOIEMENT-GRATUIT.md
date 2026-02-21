# Déployer le projet Corlay gratuitement (partage par lien)

Ce guide permet de mettre en ligne **frontend**, **backend** et **base de données** avec des offres gratuites, puis d’envoyer un simple lien (ex. Vercel) pour que quelqu’un teste l’application sans installer pgAdmin ni lancer les projets en local.

## Vue d’ensemble

| Composant   | Plateforme recommandée | Rôle |
|------------|--------------------------|------|
| **Frontend** (React/Vite) | **Vercel** | Interface utilisateur → lien à partager |
| **Backend** (NestJS)      | **Render** | API (port 3001 en local, URL Render en prod) |
| **Base de données** (PostgreSQL) | **Neon** ou **Supabase** | Remplace PostgreSQL local / pgAdmin |

Tout est gratuit (limites des offres free tier). Aucun abonnement payant nécessaire.

---

## 1. Prérequis

- Un compte **GitHub** (gratuit).
- Le projet poussé sur un dépôt GitHub (ex. `projet_corlay` ou `corlay`).

Si le projet n’est pas encore sur GitHub :

```bash
cd c:\Users\ASUS\projet_corlay
git init
git add .
git commit -m "Initial commit"
# Créez un repo sur github.com puis :
git remote add origin https://github.com/VOTRE_USER/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Base de données PostgreSQL (gratuite)

Au lieu de pgAdmin en local, on utilise une base PostgreSQL hébergée.

### Option A : Neon (recommandé)

1. Allez sur [neon.tech](https://neon.tech) et créez un compte (gratuit).
2. Créez un projet (ex. `corlay`).
3. Dans le tableau de bord, récupérez l’**URL de connexion** (Connection string), par ex. :
   ```txt
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Copiez cette URL : vous en aurez besoin pour le backend (Render).

### Option B : Supabase

1. Allez sur [supabase.com](https://supabase.com) → Create a project.
2. Dans **Project Settings → Database**, copiez l’**URI** (format `postgresql://postgres:...@...supabase.co:5432/postgres`).

Vous utiliserez cette URL comme `DATABASE_URL` pour le backend.

---

## 3. Backend sur Render

1. Allez sur [render.com](https://render.com) et connectez-vous (gratuit).
2. **New → Web Service**.
3. Connectez votre dépôt GitHub et choisissez le repo du projet.
4. **Configuration :**
   - **Root Directory** : `backend` (le dossier qui contient `package.json` du backend).
   - **Runtime** : Node.
   - **Build Command** :  
     `npm install && npx prisma generate && npm run build`
   - **Start Command** :  
     `npx prisma db push && npm run start`
   - **Instance Type** : Free.

5. **Environment Variables** (à ajouter dans l’onglet Environment) :

   | Variable       | Valeur |
   |----------------|--------|
   | `DATABASE_URL` | L’URL Neon ou Supabase (étape 2) |
   | `JWT_SECRET`   | Une chaîne secrète (ex. `corlay-prod-secret-xyz`) |
   | `PORT`         | `3001` (ou laisser Render le définir) |
   | `NODE_ENV`     | `production` |

6. Sauvegardez. Render va builder et déployer. Une fois terminé, vous aurez une URL du type :
   ```txt
   https://votre-service.onrender.com
   ```
   C’est l’URL de votre **API**. Notez-la pour l’étape Frontend.

**Note :** En free tier, le service “s’endort” après inactivité ; le premier chargement peut prendre 1–2 minutes.

---

## 4. Frontend sur Vercel (lien à partager)

1. Allez sur [vercel.com](https://vercel.com) et connectez-vous (gratuit).
2. **Add New → Project** et importez le même dépôt GitHub.
3. **Configuration :**
   - **Root Directory** : `frontend` (le dossier qui contient le projet Vite/React).
   - **Framework Preset** : Vite (détecté automatiquement).
   - **Build Command** : `npm run build` (par défaut).
   - **Output Directory** : `dist` (par défaut pour Vite).

4. **Environment Variables** (Important) :

   | Variable         | Valeur |
   |------------------|--------|
   | `VITE_API_URL`   | L’URL du backend Render, **sans slash final** (ex. `https://votre-service.onrender.com`) |

   Sans `VITE_API_URL`, le frontend appellera `http://localhost:3001` et ne fonctionnera pas en production.

5. Déployez. Vercel vous donnera une URL du type :
   ```txt
   https://votre-projet.vercel.app
   ```
   **C’est ce lien que vous envoyez** pour que quelqu’un teste l’application.

6. (Recommandé) Dans le backend (Render), vous pouvez restreindre CORS à cette origine. Dans **Environment** du service Render, ajoutez :
   - `FRONTEND_URL` = `https://votre-projet.vercel.app`  
   et adaptez le backend pour utiliser `process.env.FRONTEND_URL` dans `enableCors({ origin: ... })` (voir section 6).

---

## 5. Données initiales (seed)

Après le premier déploiement, la base sur Neon/Supabase est vide. Pour avoir des utilisateurs et des rôles de test :

1. En local, dans le dossier `backend`, configurez temporairement `.env` avec la même `DATABASE_URL` que celle utilisée sur Render (Neon/Supabase).
2. Exécutez :
   ```bash
   cd backend
   npx prisma db push
   npm run db:seed
   ```
   Cela crée les tables et insère les comptes de test (voir `docs/COMPTES-PAR-PROFIL.md`).

Vous pouvez aussi exécuter le seed une seule fois depuis votre machine après le premier déploiement Render, en pointant `.env` vers la base Neon/Supabase.

---

## 6. CORS (optionnel mais recommandé en prod)

Pour que le frontend Vercel puisse appeler le backend Render, CORS doit autoriser l’origine du front. Le backend a déjà `origin: true` (toutes origines), ce qui suffit pour un test.

Pour restreindre à votre front uniquement :

1. Dans `backend/src/main.ts`, remplacez par exemple :
   ```ts
   const frontOrigin = process.env.FRONTEND_URL || true;
   app.enableCors({
     origin: frontOrigin,
     credentials: true,
   });
   ```
2. Sur Render, ajoutez la variable d’environnement **FRONTEND_URL** = `https://votre-projet.vercel.app`.

---

## 7. Récapitulatif : ce que vous partagez

- **Lien à envoyer** : `https://votre-projet.vercel.app`
- La personne ouvre ce lien, se connecte avec un des comptes du seed (voir `docs/COMPTES-PAR-PROFIL.md`) et peut tester l’application complète (frontend + backend + BDD) sans rien installer.

---

## 8. En cas de problème

- **Erreur réseau / API** : vérifier que `VITE_API_URL` sur Vercel pointe bien vers l’URL Render (sans slash final).
- **Backend qui ne démarre pas** : vérifier les logs Render (Logs) et que `DATABASE_URL` est correcte et que `npx prisma db push` a bien créé les tables (vous pouvez lancer le seed en local une fois avec cette URL).
- **Page blanche ou 404** : Vercel doit servir le SPA (voir `frontend/vercel.json` si présent) ; en général le preset Vite gère déjà les routes.

---

## Résumé des plateformes (gratuit)

| Service  | Rôle        | Lien |
|----------|-------------|------|
| **Vercel**  | Frontend → lien à partager | [vercel.com](https://vercel.com) |
| **Render**  | Backend NestJS              | [render.com](https://render.com) |
| **Neon**    | PostgreSQL                 | [neon.tech](https://neon.tech) |
| **Supabase**| PostgreSQL (alternative)    | [supabase.com](https://supabase.com) |

Aucun abonnement payant n’est nécessaire pour faire tester le projet par lien.
