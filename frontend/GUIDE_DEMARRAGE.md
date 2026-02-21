# 🚀 Guide de Démarrage - FuelDispatch Frontend

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** : version 18+ (actuellement v22.14.0) ✅
- **npm** : version 9+ (actuellement v11.1.0) ✅
- **Git** (optionnel, pour le versioning)
- Un éditeur de code (VS Code recommandé)

---

## 🔧 Installation

### 1. Vérifier l'installation de Node.js

```bash
node --version
# Devrait afficher : v22.14.0 ou supérieur

npm --version
# Devrait afficher : 11.1.0 ou supérieur
```

### 2. Installation des dépendances

```bash
cd frontend
npm install
```

Cette commande installera toutes les dépendances listées dans `package.json` :
- React 18
- React Router v6
- TailwindCSS
- Lucide React (icônes)
- Recharts (graphiques)
- Vite (build tool)

---

## 🎮 Lancement de l'Application

### Mode Développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

Vous devriez voir dans le terminal :
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Ouvrir dans le navigateur

1. Ouvrez votre navigateur (Chrome, Firefox, Edge, Safari)
2. Naviguez vers : `http://localhost:5173`
3. Vous devriez voir le **Dashboard** de FuelDispatch 🎉

---

## 🗺️ Navigation dans l'Application

### Sidebar (Menu Latéral)

Cliquez sur les différentes sections :

1. **Tableau de Bord** (/) - Vue d'ensemble
2. **Commandes** (/commandes) - Gestion des commandes
3. **Expédition** (/expedition) - Dispatching et assignation
4. **Suivi en Temps Réel** (/suivi) - Carte GPS des véhicules
5. **Gestion des Stocks** (/stocks) - Réservoirs 3D animés 🌊
6. **Actions** (/actions) - Tâches et activités
7. **Rapports** (/rapports) - Analytics et statistiques
8. **Transporteurs** (/transporteurs) - Gestion de la flotte

---

## 🎨 Fonctionnalités à Tester

### Dashboard
- ✅ Voir les 4 KPIs principaux
- ✅ Carte de suivi de flotte
- ✅ Panel des missions (4 onglets)
- ✅ Widget d'alertes
- ✅ Widget des stocks

### Commandes
- ✅ Filtrer les commandes (recherche, statut, type, priorité, date)
- ✅ Sélectionner plusieurs commandes
- ✅ Cliquer sur "NOUVELLE COMMANDE" pour ouvrir le modal
- ✅ Remplir le formulaire de création
- ✅ Cliquer sur les 3 points pour le menu d'actions

### Expédition
- ✅ Voir les commandes à dispatcher
- ✅ Voir les transporteurs disponibles
- ✅ Badge "Recommandé par IA" ⭐
- ✅ Cliquer sur "Assigner" pour une commande
- ✅ Sélectionner un transporteur
- ✅ Confirmer l'assignation

### Suivi en Temps Réel
- ✅ Liste des véhicules à gauche
- ✅ Rechercher un véhicule
- ✅ Cliquer sur un véhicule pour le sélectionner
- ✅ Voir le popup détaillé sur la carte
- ✅ Alerte de déviation en bas
- ✅ Boutons de zoom +/-

### Gestion des Stocks
- ✅ Voir les 2 dépôts
- ✅ **Observer l'animation des vagues** sur les réservoirs 🌊
- ✅ Badges d'alerte (CRITIQUE, LOW)
- ✅ Widget d'alertes boursières
- ✅ Tableau des mouvements
- ✅ Widget valeur totale avec donut chart

### Actions
- ✅ Voir les 4 stats
- ✅ Filtrer par onglets (Toutes, À faire, En cours, Terminées)
- ✅ Cocher une action pour la marquer comme terminée
- ✅ Cliquer sur "Nouvelle Action"

### Rapports
- ✅ Changer la période (Jour, Semaine, Mois, etc.)
- ✅ Voir les 4 stats avec tendances
- ✅ Top 5 clients
- ✅ Répartition par produit
- ✅ Performance transporteurs
- ✅ Cliquer sur "Exporter PDF" ou "Exporter Excel"

### Transporteurs
- ✅ Voir les 5 stats de la flotte
- ✅ Rechercher un transporteur
- ✅ Filtrer par statut
- ✅ Cliquer sur "Voir Détails" pour ouvrir le modal
- ✅ Explorer l'historique des missions

---

## 🛠️ Commandes Disponibles

```bash
# Lancer en mode développement
npm run dev

# Créer un build de production
npm run build

# Prévisualiser le build de production
npm run preview
```

---

## 📁 Structure des Fichiers

```
frontend/
├── src/
│   ├── components/     # Tous les composants réutilisables
│   ├── pages/          # Les 8 pages principales
│   ├── App.jsx         # Routeur principal
│   ├── main.jsx        # Point d'entrée
│   └── style.css       # Styles globaux + animations
├── public/             # Assets statiques
├── index.html          # Template HTML
├── package.json        # Dépendances
├── tailwind.config.js  # Config TailwindCSS
└── vite.config.js      # Config Vite
```

---

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `tailwind.config.js` :

```javascript
colors: {
  primary: {
    DEFAULT: '#FF8C42',  // Orange
    dark: '#2C3E50',      // Bleu foncé
  },
  secondary: {
    DEFAULT: '#34D399',   // Vert
  },
}
```

### Typographie

Deux familles de polices sont utilisées :
- **Inter** : Texte principal (sans-serif)
- **Playfair Display** : Titres élégants (serif)

---

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifier que le port 5173 n'est pas déjà utilisé
2. Supprimer `node_modules` et réinstaller :
   ```bash
   rm -rf node_modules
   npm install
   ```

### Erreurs de dépendances

```bash
npm install --legacy-peer-deps
```

### Page blanche

1. Vérifier la console du navigateur (F12)
2. Vérifier que tous les imports sont corrects
3. Redémarrer le serveur de dev

### Animations ne fonctionnent pas

Les animations CSS sont définies dans `src/style.css`. Assurez-vous que le fichier est bien importé.

---

## 📱 Responsive Design

L'application est responsive et fonctionne sur :
- 📱 **Mobile** : 320px+
- 📱 **Tablet** : 768px+
- 💻 **Desktop** : 1024px+
- 🖥️ **Large Desktop** : 1440px+

### Tester en mode mobile

1. Ouvrir DevTools (F12)
2. Cliquer sur l'icône de téléphone
3. Sélectionner un appareil (iPhone, iPad, etc.)

---

## 🔥 Hot Reload

Le **Hot Module Replacement (HMR)** est activé par défaut avec Vite.

Toute modification des fichiers `.jsx` ou `.css` sera **automatiquement reflétée** dans le navigateur sans recharger la page !

---

## 🚀 Build de Production

### Créer le build

```bash
npm run build
```

Cela créera un dossier `dist/` avec les fichiers optimisés :
- HTML minifié
- CSS optimisé
- JavaScript bundlé et minifié
- Assets optimisés

### Prévisualiser le build

```bash
npm run preview
```

Accessible sur : `http://localhost:4173`

### Déployer

Le contenu du dossier `dist/` peut être déployé sur :
- **Vercel** (recommandé pour React)
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- **Google Firebase Hosting**

---

## 📚 Documentation Complémentaire

- 📖 **README.md** - Documentation générale
- 📋 **MODULES_COMPLETED.md** - Détails de chaque module
- 🎊 **PROJET_COMPLETE.md** - Récapitulatif complet
- 📄 **Cahier des Charges** - Spécifications du projet

---

## 💡 Conseils

### Pour le Développement

1. **Utilisez les DevTools** (F12) pour débugger
2. **Installez React Developer Tools** (extension navigateur)
3. **Utilisez VS Code** avec les extensions :
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux snippets

### Pour Tester

1. Testez sur différents navigateurs (Chrome, Firefox, Safari, Edge)
2. Testez en mode responsive
3. Testez avec des données différentes
4. Vérifiez les performances (Lighthouse)

### Pour Apprendre

1. Explorez le code des composants
2. Modifiez les styles TailwindCSS
3. Ajoutez de nouvelles fonctionnalités
4. Consultez la documentation React et TailwindCSS

---

## 🆘 Support

En cas de problème :

1. **Vérifier la console** du navigateur (F12)
2. **Vérifier le terminal** où tourne le serveur
3. **Consulter la documentation** dans README.md
4. **Chercher dans les fichiers** de code

---

## 🎉 Prêt à Commencer !

Vous êtes maintenant prêt à :
- ✅ Explorer l'application
- ✅ Tester toutes les fonctionnalités
- ✅ Modifier le code
- ✅ Développer le backend
- ✅ Préparer la mise en production

**Bon développement ! 🚀**

---

**Date** : 17 février 2026  
**Version** : 1.0.0  
**Statut** : ✅ Prêt pour utilisation
