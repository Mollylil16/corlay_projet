# Connectivité frontend / backend et données dynamiques

## Workflow Commande : Trésorerie → Facturation → Logistique

1. **Commercial** crée un bon de commande → statut `en_attente_tresorerie`.
2. **Trésorerie** (profil `tresorerie`) : voit les commandes en attente, vérifie le paiement, renseigne moyen (chèque/virement), n° chèque ou n° transaction, valide → statut `valide_tresorerie`.
3. **Facturation** (profil `facturation`) : voit les commandes validées Trésorerie, saisit le numéro de bon de commande interne (collé depuis leur système), valide → statut `validee`.
4. **Logistique / Dispatcher** : ne peut créer un bon de livraison que pour les commandes au statut `validee`.

Rôles ajoutés : `tresorerie`, `facturation`. Permissions : `valider-tresorerie`, `valider-facturation`, `voir-commandes`.

---

Ce document explique ce qui est connecté à 100 % au backend (et à la BDD), ce qui ne l’était pas au départ, et **pourquoi** certains éléments (Audit, Rapports, Abonnements) étaient sans API ou “obsolètes”.

---

## 1. Pourquoi l’Audit était sans API ?

**Raison :** Au moment de la première version, le backend NestJS n’avait **pas de module ni de table pour l’audit**. Le schéma Prisma ne contenait pas de modèle `AuditLog`, et il n’y avait aucun contrôleur `audit` ou `audit-logs`. Le frontend (AuditContext) gardait donc les logs **uniquement en mémoire** (useState), sans persistance.

**Ce qui a été fait :**
- Ajout du modèle **AuditLog** dans `prisma/schema.prisma` (userId, userName, action, entity, entityId, description, timestamp).
- Création du **module Audit** (controller `GET /audit-logs`, `POST /audit-logs`) et enregistrement dans `AppModule`.
- **AuditContext** charge les logs via `GET /audit-logs` et enregistre les nouveaux via `POST /audit-logs`. La page Audit (Trail) affiche donc des données **liées à la BDD**.

**À faire après déploiement du schéma :**  
Exécuter `npx prisma db push` (ou une migration) pour créer la table `AuditLog` en base.

---

## 2. Pourquoi “Rapports” était obsolète ?

**Raison :** Il existait **deux** pages “Rapports” :
- **Rapports.jsx** : ancienne page avec **toutes les données en dur** (stats 1,247 / 2.8M / 892 / 485M, top clients, transporteurs, etc.). Aucun appel API.
- **RapportsNew.jsx** : page refaite pour utiliser **useApp()** (commandes, bonsLivraison, transporteurs) et afficher des stats et graphiques **calculés à partir des données API**.

La route `/rapports` dans `App.jsx` pointe vers **RapportsNew** uniquement. Donc **Rapports.jsx n’est plus utilisée** : elle est “obsolète” dans le sens où elle est du code mort, remplacée par la version dynamique (RapportsNew).

**Ce qui a été fait :**
- Suppression de **Rapports.jsx** pour éviter la confusion et les données statiques. Toute la fonctionnalité “Rapports” repose sur **RapportsNew**, 100 % branchée sur le backend (commandes, BL, transporteurs).

---

## 3. Pourquoi le catalogue Abonnements est en “référence” ?

**Raison :** La page Abonnements affiche des **plans** (Gratuit, Premium, Enterprise) avec prix et listes de fonctionnalités. Dans le backend, il n’y avait **ni modèle Plan ni table d’abonnement** : les offres étaient donc codées en dur dans le front (tableau `plans`). C’est un **catalogue produit** (tarification), pas encore une entité métier gérée en BDD.

**État actuel :**
- La page utilise **useAuth()** pour les utilisateurs (nombre d’utilisateurs actifs, etc.), donc une partie est déjà dynamique.
- Les **libellés et prix des plans** restent définis dans le frontend tant qu’il n’existe pas d’API “plans” ou “abonnements”.

**Ce qui a été fait (100 % lié à la BDD) :**  
- Modèles **Plan** et **Subscription** dans Prisma, module **Plans** avec `GET /plans`, `GET /subscriptions/me`, `POST /subscriptions`.  
- Seed des 3 plans (free, premium, enterprise).  
- La page **Abonnements** charge les plans depuis l’API et l’abonnement actuel depuis `GET /subscriptions/me` ; la souscription est enregistrée via `POST /subscriptions`.

---

## 4. Récapitulatif : tout est-il connecté et dynamique ?

| Zone | Connecté au backend / BDD | Remarque |
|------|---------------------------|-----------|
| Auth, Users | Oui | Login, CRUD utilisateurs via API |
| Commandes, BL, Véhicules, Dépôts, Transporteurs, Alertes, Incidents | Oui | Tous les modules + Prisma |
| Dashboard (KPIs, graphique 7 jours) | Oui | Données dérivées de useApp() (BL, commandes, véhicules) |
| Rapports (RapportsNew) | Oui | Stats, graphiques, top clients, transporteurs depuis API |
| Expédition (ExpeditionDnD) | Oui | Transporteurs API + création BL en BDD à l’assignation |
| Gestion stocks, Mouvements, Alertes stocks | Oui | Dépôts/cuves, BL livrés, alertes API |
| Facturation | Oui | Basée sur les BL livrés (API) |
| **Audit** | Oui (après ajout module) | GET/POST /audit-logs, AuditContext + page Trail liés à la BDD |
| **IA (recommandation transporteur)** | Oui | “Recommandé par IA” = `statut === 'disponible'` (données transporteurs API) |
| Abonnements (liste des plans) | Partiel | Utilisateurs dynamiques ; catalogue plans encore en front (optionnel : API Plans) |

**Données statiques / démo supprimées :**  
Plus de bloc “Connexion rapide (Démo)” au login, plus de listes fictives dans Incidents, GestionStocks, Rapports (ancienne page supprimée), MissionsPanel, StockLevels, AlertsWidget, StockMovementsTable, etc. Tout ce qui peut venir du backend est alimenté par l’API et la BDD.

---

## 5. Commande Prisma après ajout d’AuditLog

À la racine du backend :

```bash
npx prisma db push
```

Cela crée la table `AuditLog` dans PostgreSQL. Ensuite, les logs d’audit sont bien persistés et la page Audit affiche des données **100 % liées à la BDD**.
