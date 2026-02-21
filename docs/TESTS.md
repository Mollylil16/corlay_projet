# Tests – Projet Corlay

Ce document décrit les **tests unitaires**, **d’intégration** et de **validation** du projet.

---

## Backend (NestJS + Jest)

### Lancer les tests

```bash
cd backend
npm test           # exécution une fois
npm run test:watch # mode watch
npm run test:cov   # avec rapport de couverture
```

### Contenu des tests

| Fichier | Type | Description |
|--------|------|-------------|
| `src/commandes/commandes.service.spec.ts` | Unitaire | `CommandesService` : création (statut `en_attente_tresorerie`), `validationTresorerie`, `validationFacturation` (rejets et succès) |
| `src/commandes/dto/validation-tresorerie.dto.spec.ts` | Validation | DTO Trésorerie : `paiementRecu` requis et booléen, champs optionnels |
| `src/commandes/dto/validation-facturation.dto.spec.ts` | Validation | DTO Facturation : `numeroBonCommandeInterne` requis et chaîne |
| `src/commandes/commandes.integration.spec.ts` | Intégration | API HTTP : `GET /commandes`, `PATCH .../validation-tresorerie`, `PATCH .../validation-facturation` (avec Prisma et JWT mockés) |

Les tests d’intégration utilisent un `PrismaService` mocké (pas de base réelle) et un garde JWT désactivé.

---

## Frontend (React + Vitest)

### Lancer les tests

```bash
cd frontend
npm run test:run      # exécution une fois
npm test              # mode watch
npm run test:coverage # avec couverture
```

### Contenu des tests

| Fichier | Type | Description |
|--------|------|-------------|
| `src/context/AuthContext.test.jsx` | Unitaire / composant | Rôles Trésorerie/Facturation, `PERMISSIONS`, `hasPermission` selon le rôle (admin, tresorerie, facturation) |
| `src/test/validation.test.js` | Validation | Workflow commandes : `canValidateTresorerie`, `canValidateFacturation`, `canCreateBL`, ordre des statuts |

---

## Résumé

- **Backend** : 21 tests (Jest) – service commandes, DTOs, API commandes.
- **Frontend** : 14 tests (Vitest) – auth/permissions, validation workflow.

Pour une vérification rapide après modification :

- Backend : `cd backend && npm test`
- Frontend : `cd frontend && npm run test:run`
