# Comptes de test par profil

Utilisez ces identifiants pour vous connecter et voir l’interface propre à chaque rôle.

**URL de connexion :** `/login` (ex. `http://localhost:5173/login` si le front tourne en dev).

---

## Tableau des accès

| Profil | Email | Mot de passe | Ce que vous verrez |
|--------|--------|--------------|--------------------|
| **Administrateur** | `admin@corlay.ci` | `admin123` | Tous les menus (Tableau de bord, Commandes, Validations, BL, Expédition, Suivi, Stocks, Analyse stocks, Incidents, Actions, Rapports, Facturation, Transporteurs, **Utilisateurs**, **Abonnements**, **Audit Trail**). Création / modification partout. |
| **Directeur** | `directeur@corlay.ci` | `demo123` | Tableau de bord, Commandes (lecture seule), Validations, Stocks (lecture seule), Incidents, Rapports, Facturation, Transporteurs (lecture seule). Pas de menu Utilisateurs / Abonnements / Audit. |
| **Manager Commercial** | `manager-commercial@corlay.ci` | `demo123` | Tableau de bord, Commandes (création + modification), Validations, Rapports, Facturation. Pas de BL, Expédition, Suivi, Stocks, Incidents, Transporteurs, Utilisateurs. |
| **Manager Logistique** | `manager-logistique@corlay.ci` | `demo123` | Tableau de bord, Commandes (lecture), Validations, Bons de livraison, Expédition, Suivi, Stocks (écriture), Incidents, Rapports, Facturation, Transporteurs (écriture). Pas d’Utilisateurs / Abonnements / Audit. |
| **Dispatcher** | `dispatcher@corlay.ci` | `dispatch123` | Tableau de bord, Bons de livraison, Expédition, Suivi, Stocks (lecture seule), Incidents, Transporteurs (lecture seule). **Pas** de menu Commandes, Validations, Rapports, Facturation, Utilisateurs. |
| **Agent Commercial** | `agent-commercial@corlay.ci` | `demo123` | Tableau de bord, Commandes (création + consultation). Pas de Validations, BL, Expédition, Suivi, Stocks, Incidents, Rapports, Transporteurs, Utilisateurs. |
| **Agent Logistique** | `agent-logistique@corlay.ci` | `demo123` | Tableau de bord, Commandes (lecture), Stocks (écriture + ajustements), Incidents. Pas de Validations, BL, Expédition, Rapports, Transporteurs, Utilisateurs. |
| **Trésorerie** | `tresorerie@corlay.ci` | `treso123` | Tableau de bord, Commandes (lecture), Validations (onglet Trésorerie), Rapports, Facturation. Pas de BL, Expédition, Suivi, Stocks, Incidents, Transporteurs, Utilisateurs. |
| **Facturation** | `facturation@corlay.ci` | `factu123` | Tableau de bord, Commandes (lecture), Validations (onglet Facturation), Rapports, Facturation. Pas de BL, Expédition, Suivi, Stocks, Incidents, Transporteurs, Utilisateurs. |

---

## Créer les comptes dans la base (première fois)

Si les comptes **Directeur, Manager Commercial, Manager Logistique, Agent Commercial, Agent Logistique** n’existent pas encore, exécutez le seed :

```bash
cd backend
npx prisma db seed
```

Cela crée ou met à jour tous les utilisateurs listés ci-dessus. Les mots de passe sont ceux indiqués dans le tableau.

---

## Résumé rapide

- **Admin** : tout voir, tout faire.  
- **Directeur** : validations + rapports + vue globale, lecture seule Commandes / Stocks / Transporteurs.  
- **Manager Commercial** : commandes + validations commerciales + rapports.  
- **Manager Logistique** : logistique (BL, expédition, suivi, stocks, transporteurs) + validations BL + rapports.  
- **Dispatcher** : BL, expédition, suivi, incidents ; pas de validations ni rapports.  
- **Agent Commercial** : uniquement commandes (création et consultation).  
- **Agent Logistique** : commandes (lecture), stocks (ajustements), incidents.  
- **Trésorerie** : validations trésorerie + commandes (lecture) + rapports.  
- **Facturation** : validations facturation + commandes (lecture) + rapports.
