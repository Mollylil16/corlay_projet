# Dépôts et cuves – Origine des données et usage

## D'où viennent les données ?

- **Dépôts et cuves** sont chargés **depuis l'API** : `GET /depots` (backend).
- Le **seed** ne crée **aucun** dépôt, cuve, alerte ni bon de livraison. En production, tout part de zéro : **alertes stocks**, **mouvements de stock** et **valeur de stock** proviennent uniquement de ce que vous enregistrez (dépôts créés, BL livrés). Pas de données fictives.
- Pour repartir sans les anciennes données démo : `cd backend` puis `npm run db:reset`. Ensuite, créez vos vrais dépôts avec **CRÉER UN DÉPÔT**.

## Créer un dépôt

1. Aller dans **Gestion des stocks**.
2. Cliquer sur **« CRÉER UN DÉPÔT »**.
3. Remplir le formulaire : nom du dépôt, statut, et les cuves (numéro, nom, type, capacité, pourcentage). Vous pouvez ajouter plusieurs cuves avec **« Ajouter une cuve »**.
4. Valider : le backend enregistre le dépôt et les cuves (`POST /depots`).

## Remplir / ajuster les cuves

- **Ajustement depuis l'interface**  
  Le bouton **« + AJUSTEMENT STOCK »** ouvre un modal : vous choisissez le dépôt, la cuve et le **pourcentage** (ex. 85). Le backend met à jour la cuve (`PATCH /depots/:depotId/tanks/:tankId`). C'est la façon standard de « remplir » ou modifier le niveau affiché.

- **Modification en base**  
  Pour des changements en masse, vous pouvez modifier directement les tables `Depot` et `Tank` (pgAdmin, script SQL, etc.).

## Récapitulatif

| Question | Réponse |
|----------|--------|
| Données fictives ? | Non : le seed ne crée pas de dépôts. Tout ce qui s'affiche vient de ce que vous créez. |
| Comment créer un dépôt ? | **Gestion des stocks** → **CRÉER UN DÉPÔT** (modal avec nom, statut, cuves). |
| Comment remplir les cuves ? | **AJUSTEMENT STOCK** (modal dépôt / cuve / pourcentage). |
