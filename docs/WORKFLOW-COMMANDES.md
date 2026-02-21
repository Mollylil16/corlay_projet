# Workflow des commandes en 4 étapes – Vérification

Ce document décrit ce qui est en place et comment vérifier que le workflow Commercial → Trésorerie → Facturation → Logistique fonctionne.

---

## 1. Ce qui est en place

### Étape 1 – Commercial
- Création du bon de commande : **Commandes** → **Nouvelle commande** (client, type, quantité, date, priorité, etc.).
- À la création, la commande reçoit le statut **`en_attente_tresorerie`** et ne part pas en logistique.

### Étape 2 – Trésorerie (Finance)
- Les commandes **en attente Trésorerie** apparaissent dans **Validations** → onglet **Trésorerie**.
- La Trésorerie peut :
  - indiquer que le **paiement a été reçu** (oui/non) ;
  - renseigner le **moyen de paiement** (chèque, virement, espèces, autre) ;
  - selon le moyen : **numéro de chèque** ou **numéro de transaction / référence de virement**.
- Bouton **Valider** : la commande passe en **`valide_tresorerie`**.
- Tant que la Trésorerie n’a pas validé, la commande **ne va pas** à la Facturation (le backend refuse la validation facturation si le statut n’est pas `valide_tresorerie`).

### Étape 3 – Facturation
- Les commandes **validées Trésorerie** apparaissent dans **Validations** → onglet **Facturation**.
- La Facturation saisit (ou colle) le **numéro de bon de commande interne** (système externe).
- Bouton **Valider** : la commande passe en **`validee`** et est **disponible pour la logistique**.
- Tant que la Facturation n’a pas validé, la commande **n’apparaît pas** dans Expédition / Dispatching (le dispatcher ne voit que les commandes avec statut `validee`).

### Étape 4 – Logistique (Dispatcher)
- Les commandes **validées Facturation** (statut **`validee`**) apparaissent dans **Expédition & Dispatching**.
- Le dispatcher crée le **bon de livraison** (BL) comme aujourd’hui (assignation commande → transporteur).

### Profils et autorisations
- **Trésorerie** : rôle `tresorerie` → permissions `voir-commandes`, `valider-tresorerie`. Onglet Trésorerie visible ; pas d’onglet Facturation ni Bons de livraison (sauf si autre rôle).
- **Facturation** : rôle `facturation` → permissions `voir-commandes`, `valider-facturation`. Onglet Facturation visible.
- **Dispatcher** : rôle `dispatcher` → accès Expédition, création BL ; ne voit que les commandes `validee`.

### Données enregistrées (backend)
- **Trésorerie** : `paiementRecu`, `moyenPaiement`, `numeroCheque`, `numeroTransactionVirement`, `dateValidationTresorerie`.
- **Facturation** : `numeroBonCommandeInterne`, `dateValidationFacturation`.

---

## 2. Comment vérifier dans le système

### A. Comptes de test (après `npm run db:reset`)

| Rôle         | Email                  | Mot de passe |
|-------------|------------------------|--------------|
| Admin       | admin@corlay.ci        | admin123     |
| Dispatcher  | dispatcher@corlay.ci   | dispatch123  |
| Trésorerie  | tresorerie@corlay.ci   | treso123     |
| Facturation | facturation@corlay.ci  | factu123     |

L’admin a tous les droits. Les autres ne voient que ce que leur rôle autorise.

### B. Scénario de vérification

1. **Créer une commande (Commercial / Admin)**  
   - Se connecter avec **admin@corlay.ci**.  
   - Aller dans **Commandes** → **Nouvelle commande** → remplir et enregistrer.  
   - Vérifier dans la liste : la commande a le statut **Trésorerie** (ou **En attente Trésorerie**).

2. **Vérifier que la commande n’est pas en logistique**  
   - Aller dans **Expédition & Dispatching**.  
   - La commande **ne doit pas** apparaître dans « Commandes à Dispatcher » (elle n’est pas encore `validee`).

3. **Validation Trésorerie**  
   - Se connecter avec **tresorerie@corlay.ci** (ou rester en admin).  
   - Aller dans **Validations** → onglet **Trésorerie**.  
   - La commande doit apparaître. Cliquer dessus, renseigner paiement reçu, moyen de paiement, éventuellement n° chèque ou référence virement, puis **Valider**.  
   - Vérifier : la commande disparaît de l’onglet Trésorerie.

4. **Vérifier qu’elle n’est toujours pas en logistique**  
   - Aller dans **Expédition & Dispatching** : la commande **ne doit toujours pas** apparaître (statut `valide_tresorerie`, pas encore `validee`).

5. **Validation Facturation**  
   - Se connecter avec **facturation@corlay.ci** (ou admin).  
   - **Validations** → onglet **Facturation**.  
   - La commande doit apparaître. Saisir un **numéro de bon de commande interne** (ex. BC-INT-2024-001), puis **Valider**.  
   - Vérifier : la commande disparaît de l’onglet Facturation.

6. **Vérifier la logistique**  
   - Aller dans **Expédition & Dispatching** : la commande **doit** apparaître dans « Commandes à Dispatcher ».  
   - Créer un BL en assignant un transporteur (comme aujourd’hui).

### C. Vérifications techniques (optionnel)

- **Backend** : dans `backend/src/commandes/commandes.service.ts`, `create()` met `statut: 'en_attente_tresorerie'` ; `validationTresorerie()` exige `statut === 'en_attente_tresorerie'` et passe en `valide_tresorerie` ; `validationFacturation()` exige `statut === 'valide_tresorerie'` et passe en `validee`.
- **Frontend Expédition** : dans `ExpeditionDnD.jsx`, `commandesADispatcher = commandes.filter((cmd) => cmd.statut === 'validee')` : seules les commandes validées Facturation sont proposées au dispatcher.
- **Permissions** : dans `frontend/src/context/AuthContext.jsx`, les rôles `tresorerie` et `facturation` ont respectivement `valider-tresorerie` et `valider-facturation` ; la page Validations affiche uniquement les onglets pour lesquels l’utilisateur a la permission.

---

## 3. Résumé

| Étape        | Statut avant      | Action                    | Statut après       |
|-------------|-------------------|---------------------------|--------------------|
| Commercial  | —                 | Créer la commande         | en_attente_tresorerie |
| Trésorerie  | en_attente_tresorerie | Valider (paiement, moyen, n°) | valide_tresorerie |
| Facturation | valide_tresorerie | Valider (n° BC interne)   | validee            |
| Logistique  | validee           | Créer le BL               | (BL créé)          |

Le workflow est bien en place ; le scénario ci-dessus permet de s’assurer qu’il fonctionne correctement dans le système.
