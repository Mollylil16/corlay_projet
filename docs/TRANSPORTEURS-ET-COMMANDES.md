# Enregistrer les transporteurs et les commandes (données dynamiques)

## État initial : aucune donnée fictive

Le seed backend **ne crée aucune donnée métier** : pas de dépôts, cuves, transporteurs, commandes, bons de livraison ni alertes. Il crée uniquement :
- les **comptes de connexion** (admin, dispatcher) ;
- les **plans** abonnements (Gratuit, Premium, Enterprise).

Tout le reste (dépôts, transporteurs, commandes, BL) se crée via l’application. **Pour repartir à zéro** : `cd backend` puis `npm run db:reset`.  l’app : 
## D’où viennent les données ?

- **Transporteurs** : chargés depuis l’API `GET /transporteurs`. Vous les créez via **Gestion des transporteurs** → **Enregistrer un transporteur**.
- **Commandes** : chargées depuis l’API `GET /commandes`, créées via **Commandes** → Nouvelle commande, puis validations Trésorerie / Facturation.
- **Dépôts et cuves** : créés via **Gestion des stocks** → **Créer un dépôt**.

Aucune donnée fictive en production : tout ce qui s’affiche vient de ce que vous enregistrez.

---

## Comment enregistrer un transporteur

1. Aller dans **Gestion des transporteurs** (menu).
2. Cliquer sur le bouton **« Enregistrer un transporteur »** (ou « Nouveau transporteur »).
3. Remplir le formulaire :
   - **Immatriculation** * (ex. CI-3903-X)
   - **Chauffeur** * (nom du chauffeur)
   - **Téléphone** *
   - **Capacité** (ex. 24 000 L)
   - **Type** (Citerne, etc.)
   - **Statut** (Disponible, En mission, Maintenance)
4. Cliquer sur **Enregistrer**.

Le transporteur est créé en base et apparaît immédiatement dans la liste et sur la page **Expédition & Dispatching** (s’il est « Disponible »).

---

## Comment avoir des commandes à dispatcher

Les commandes affichées dans **Expédition** sont celles dont le statut est **Validée** (workflow Trésorerie → Facturation terminé).

1. Aller dans **Commandes** → **Nouvelle commande** et créer une commande.
2. Dans **Validations** → onglet **Trésorerie** : valider le paiement pour cette commande.
3. Dans **Validations** → onglet **Facturation** : saisir le n° de bon de commande interne et valider.
4. La commande passe en statut **Validée** et apparaît dans **Expédition & Dispatching** dans « Commandes à Dispatcher ».

---

## Récapitulatif

| Besoin | Où le faire |
|--------|--------------|
| Ajouter un transporteur | **Gestion des transporteurs** → Enregistrer un transporteur |
| Modifier un transporteur | Backend : `PATCH /transporteurs/:id` (UI détaillée à prévoir si besoin) |
| Créer une commande | **Commandes** → Nouvelle commande |
| Voir des commandes à dispatcher | Valider en Trésorerie puis en Facturation ; elles apparaissent en **Expédition** |

Les données affichées sur **Expédition & Dispatching** (commandes à dispatcher, transporteurs disponibles) sont donc **dynamiques et réelles** dès que vous utilisez ces écrans pour enregistrer transporteurs et commandes.
