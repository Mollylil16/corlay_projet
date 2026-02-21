# Déployer le frontend sur Netlify

## 1. Vérifier le build en local

Dans le dossier `frontend` :

```bash
npm run build
```

Si la commande réussit, un dossier `dist` est créé (c’est ce que Netlify publiera).

---

## 2. Mettre le projet sur Git (recommandé)

Netlify déploie à partir d’un dépôt Git (GitHub, GitLab, Bitbucket).

1. Créez un dépôt sur [GitHub](https://github.com) (ou autre).
2. À la racine du projet (ou dans `frontend` si vous déployez uniquement le frontend) :

```bash
git init
git add .
git commit -m "Initial commit - frontend FuelDispatch"
git branch -M main
git remote add origin https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git
git push -u origin main
```

---

## 3. Déployer sur Netlify

### Option A : Via le site Netlify (recommandé)

1. Allez sur [https://app.netlify.com](https://app.netlify.com) et connectez-vous (ou créez un compte).
2. **Add new site** → **Import an existing project**.
3. Choisissez **GitHub** (ou GitLab/Bitbucket) et autorisez Netlify.
4. Sélectionnez le dépôt du projet.
5. **Paramètres de build** :
   - **Base directory** : `frontend` (si le dépôt est à la racine du projet).
   - **Build command** : `npm run build` (déjà dans `netlify.toml`).
   - **Publish directory** : `frontend/dist` (ou `dist` si base directory = `frontend`).
6. Cliquez sur **Deploy site**.

Netlify va builder le site et vous donner une URL du type :  
`https://nom-aleatoire-123.netlify.app`

### Option B : Déployer uniquement le dossier frontend

Si vous créez un dépôt contenant **uniquement** le contenu du dossier `frontend` :

- Base directory : laisser vide.
- Build command : `npm run build`.
- Publish directory : `dist`.

Le fichier `netlify.toml` déjà dans `frontend` suffit, Netlify le lira automatiquement.

### Option C : Déploiement manuel (sans Git)

1. Dans le dossier `frontend` : `npm run build`.
2. Sur [app.netlify.com](https://app.netlify.com) : **Add new site** → **Deploy manually**.
3. Glissez-déposez le dossier **dist** dans la zone de dépôt.

---

## 4. Envoyer le lien à votre collaborateur

Une fois le déploiement terminé :

- L’URL du site est affichée sur le tableau de bord Netlify (ex. `https://votre-site.netlify.app`).
- Vous pouvez la personnaliser : **Domain settings** → **Options** → **Edit site name**.
- Envoyez simplement cette URL à votre collaborateur ; il pourra accéder au logiciel comme en local (connexion démo, mêmes écrans).

---

## 5. Présenter le frontend à votre collaborateur

Pour une démo en direct en local :

```bash
cd frontend
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) et partagez votre écran, ou déployez d’abord sur Netlify et parcourez ensemble l’URL en ligne.

---

## Note

- Le frontend actuel utilise des **données en mémoire** (contexte React). Si vous connectez plus tard une API réelle, il faudra éventuellement configurer une variable d’environnement (ex. `VITE_API_URL`) dans Netlify : **Site settings** → **Environment variables**.
- Identifiants de démo (si vous avez une page Login) : à communiquer à votre collaborateur pour qu’il puisse se connecter.
