# 🔐 Rôles et Permissions - FuelDispatch

## 📋 Vue d'ensemble

Le système FuelDispatch implémente un contrôle d'accès basé sur les rôles (RBAC - Role-Based Access Control) avec des workflows de validation à plusieurs niveaux.

---

## 👥 Rôles Utilisateurs

### 1. Service Commercial

#### **Agent Commercial**
- **Code rôle**: `agent-commercial`
- **Permissions**:
  - ✅ Créer des commandes (externes et internes)
  - ✅ Voir les commandes qu'il a créées
  - ✅ Modifier les commandes en statut "Nouvelle"
  - ❌ Valider les commandes
  - ❌ Accès au module Bons de Livraison
  - ❌ Accès au module Expédition
  - ✅ Voir les rapports (lecture seule)

#### **Manager Commercial**
- **Code rôle**: `manager-commercial`
- **Permissions**:
  - ✅ Toutes les permissions de l'Agent Commercial
  - ✅ Voir toutes les commandes du service
  - ✅ **Valider les commandes** créées par les agents
  - ✅ **Rejeter les commandes** avec motif obligatoire
  - ✅ Modifier les commandes validées (cas exceptionnels)
  - ❌ Accès au module Bons de Livraison
  - ✅ Voir les statistiques commerciales complètes

#### **Directeur Commercial**
- **Code rôle**: `directeur-commercial`
- **Permissions**:
  - ✅ Toutes les permissions du Manager Commercial
  - ✅ Valider/Rejeter toutes les commandes
  - ✅ Accès complet aux statistiques et rapports
  - ✅ Gestion des clients
  - ✅ Définition des tarifs

---

### 2. Service Logistique

#### **Dispatcher**
- **Code rôle**: `dispatcher`
- **Permissions**:
  - ✅ Voir toutes les commandes validées
  - ✅ **Créer des Bons de Livraison** à partir des commandes validées
  - ✅ Modifier les BL en statut "En attente validation"
  - ❌ Valider les Bons de Livraison
  - ✅ Module Expédition (assignation transporteurs)
  - ✅ Suivi en temps réel des livraisons
  - ✅ Gestion des stocks (consultation)
  - ✅ Communication avec les transporteurs
  - ❌ Créer des commandes

#### **Agent Logistique**
- **Code rôle**: `agent-logistique`
- **Permissions**:
  - ✅ Voir les commandes validées
  - ✅ Suivi des livraisons
  - ✅ Gestion des stocks (mise à jour)
  - ✅ Enregistrement des réceptions de carburant
  - ❌ Créer des Bons de Livraison
  - ❌ Assignation des transporteurs

#### **Chef de Service Logistique**
- **Code rôle**: `chef-service-logistique`
- **Permissions**:
  - ✅ Toutes les permissions du Dispatcher
  - ✅ **Valider les Bons de Livraison**
  - ✅ **Rejeter les Bons de Livraison** avec motif
  - ✅ Modifier tous les BL
  - ✅ Gestion complète des stocks
  - ✅ Gestion des alertes stock
  - ✅ Validation des réceptions de carburant

#### **Manager Logistique**
- **Code rôle**: `manager-logistique`
- **Permissions**:
  - ✅ Toutes les permissions du Chef de Service
  - ✅ Gestion des transporteurs et de la flotte
  - ✅ Paramétrage des algorithmes d'optimisation
  - ✅ Accès complet aux rapports logistiques
  - ✅ Gestion des dépôts

---

### 3. Administration

#### **Administrateur Système**
- **Code rôle**: `admin`
- **Permissions**:
  - ✅ Accès complet à tous les modules
  - ✅ Gestion des utilisateurs
  - ✅ Attribution des rôles
  - ✅ Configuration système
  - ✅ Logs et audit trail
  - ✅ Sauvegardes et restauration

---

## 🔄 Workflows de Validation

### Workflow 1 : Commande Client

```
1. Création
   └─ Agent Commercial crée une commande
      ├─ Type: Externe OU Interne
      └─ Si Interne: saisir référence commande externe
      
2. Validation Commerciale
   └─ Directeur Commercial ou Manager Commercial
      ├─ ✅ Valider → Transmise à la Logistique
      └─ ❌ Rejeter → Retour à l'Agent avec motif

3. Transmission
   └─ Commande disponible pour création BL
```

### Workflow 2 : Bon de Livraison

```
1. Création du BL
   └─ Dispatcher (Service Logistique)
      ├─ À partir d'une commande validée
      ├─ Garde l'historique du N° de commande
      ├─ Garde la référence externe (si commande interne)
      ├─ Assigne un transporteur
      └─ Définit date/heure de chargement

2. Validation du BL
   └─ Chef de Service Logistique
      ├─ ✅ Valider → Notification au transporteur
      └─ ❌ Rejeter → Retour au Dispatcher avec motif

3. Exécution
   └─ Transporteur reçoit notification
      └─ Mission visible dans l'app mobile
```

---

## 🔒 Matrice des Permissions

| Module | Agent Commercial | Manager Commercial | Directeur Commercial | Dispatcher | Chef Service Log. | Manager Log. | Admin |
|--------|-----------------|-------------------|---------------------|------------|-------------------|--------------|-------|
| **Dashboard** | Lecture | Lecture | Lecture | Lecture | Lecture | Lecture | Complet |
| **Commandes** | Créer, Voir siennes | Créer, Voir toutes, **Valider** | **Valider**, Modifier | Lecture seule | Lecture seule | Lecture seule | Complet |
| **Bons de Livraison** | ❌ Pas d'accès | ❌ Pas d'accès | ❌ Pas d'accès | **Créer**, Modifier siens | **Valider**, Modifier | **Valider**, Complet | Complet |
| **Expédition** | ❌ Pas d'accès | ❌ Pas d'accès | ❌ Pas d'accès | **Dispatcher** | Complet | Complet | Complet |
| **Suivi Temps Réel** | Lecture | Lecture | Lecture | Complet | Complet | Complet | Complet |
| **Stocks** | Lecture | Lecture | Lecture | Lecture | Complet | Complet | Complet |
| **Actions** | Voir siennes | Voir équipe | Voir service | Voir siennes | Voir équipe | Voir service | Complet |
| **Rapports** | Lecture | Stats commerciales | Stats complètes | Stats logistiques | Stats logistiques | Stats complètes | Complet |
| **Transporteurs** | ❌ Pas d'accès | ❌ Pas d'accès | ❌ Pas d'accès | Lecture | Lecture | **Gestion complète** | Complet |

**Légende:**
- ✅ = Accès complet
- Lecture = Consultation uniquement
- **Gras** = Permission spéciale importante
- ❌ = Aucun accès

---

## 📝 Règles de Gestion

### Commandes

1. **Création**
   - Seuls les agents commerciaux peuvent créer des commandes
   - Deux types : Externe (client hors Corlay) ou Interne (station Corlay)
   - Si commande interne → référence externe obligatoire

2. **Validation**
   - Validation obligatoire par Manager/Directeur Commercial
   - Commande non validée = invisible pour la logistique
   - Rejet obligatoire avec motif

3. **Statuts des Commandes**
   - `nouvelle` : Créée, en attente de validation
   - `en-attente-validation` : Soumise au manager
   - `validee` : Approuvée, transmise à la logistique
   - `rejetee` : Refusée avec motif
   - `en-cours-dispatching` : BL en cours de création
   - `dispatchee` : BL validé, mission assignée
   - `en-transit` : Livraison en cours
   - `livree` : Livrée et signée
   - `facturee` : Facture générée
   - `annulee` : Annulée avec motif

### Bons de Livraison

1. **Création**
   - Seuls les dispatchers peuvent créer des BL
   - À partir d'une commande validée uniquement
   - BL garde l'historique :
     - N° de la commande interne
     - N° de la commande externe (si applicable)

2. **Validation**
   - Validation obligatoire par Chef de Service Logistique
   - BL non validé = pas de notification au transporteur
   - Rejet obligatoire avec motif

3. **Statuts des BL**
   - `cree` : Créé par dispatcher
   - `en-attente-validation` : Soumis au chef de service
   - `valide` : Approuvé, notification au transporteur
   - `rejete` : Refusé avec motif
   - `en-cours-chargement` : Camion au dépôt
   - `charge` : Chargement terminé, en route
   - `livre` : Livraison effectuée
   - `archive` : Archivé après facturation

### Traçabilité

Chaque action doit enregistrer :
- Qui a fait l'action (ID utilisateur + nom)
- Quand (date et heure précise)
- Quoi (type d'action)
- Pourquoi (motif si rejet/annulation)

---

## 🚨 Alertes et Notifications

### Notifications Automatiques

1. **Commande créée** → Manager Commercial
2. **Commande validée** → Agent Commercial + Dispatcher
3. **Commande rejetée** → Agent Commercial (avec motif)
4. **BL créé** → Chef de Service Logistique
5. **BL validé** → Dispatcher + Transporteur
6. **BL rejeté** → Dispatcher (avec motif)

---

## 🔐 Sécurité

### Authentification
- Login avec email/mot de passe
- Token JWT avec expiration
- Refresh token
- 2FA (optionnel pour Admin)

### Autorisation
- Vérification du rôle à chaque requête API
- Middleware de vérification des permissions
- Logs de toutes les actions sensibles

### Audit Trail
- Historique complet de toutes les actions
- Conservation 5 ans minimum
- Export pour audit externe

---

## 📊 Exemple de Flux Complet

### Scénario : Commande pour Station Corlay Plateau

```
1. CLIENT EXTERNE
   └─ Envoie BC externe: CMD-EXT-2024-156

2. AGENT COMMERCIAL (Sarah Koné)
   └─ Crée commande interne: CMD-9321
      ├─ Type: Interne
      ├─ Réf. Externe: CMD-EXT-2024-156
      ├─ Client: Station Corlay Plateau
      ├─ Produit: Diesel B7
      └─ Quantité: 24,000 L
      
3. DIRECTEUR COMMERCIAL (M. Diabaté)
   └─ Valide la commande CMD-9321
      └─ Statut: Validée
      
4. DISPATCHER (Jean Diallo)
   └─ Crée BL: BL-2024-015
      ├─ Lié à: CMD-9321
      ├─ Réf. Externe: CMD-EXT-2024-156 (gardé)
      ├─ Transporteur: Moussa Traoré (CI-2021-X)
      ├─ Dépôt: Abidjan Nord
      └─ Date chargement: 25 Oct, 2024 08:00
      
5. CHEF SERVICE LOGISTIQUE (M. Kouassi)
   └─ Valide le BL-2024-015
      └─ Notification envoyée au transporteur
      
6. TRANSPORTEUR (Moussa Traoré)
   └─ Reçoit mission sur app mobile
      └─ Exécute la livraison
      
7. SYSTÈME
   └─ Génère facture automatiquement
      └─ Lien: CMD-9321 → BL-2024-015 → FAC-2024-089
```

---

## 🎯 Implémentation Frontend

### Context d'Authentification (à créer dans le backend)

```javascript
// src/context/AuthContext.jsx
const AuthContext = {
  user: {
    id: 'USER-001',
    nom: 'Jean Diallo',
    email: 'jean.diallo@corlay.ci',
    role: 'dispatcher', // Role actif
    permissions: [...], // Calculé automatiquement
  },
  token: 'jwt-token-here',
  isAuthenticated: true,
}
```

### Vérification des Permissions

```javascript
// Dans chaque composant
const canValidateCommande = () => {
  return ['manager-commercial', 'directeur-commercial'].includes(user.role);
};

const canCreateBL = () => {
  return user.role === 'dispatcher';
};

const canValidateBL = () => {
  return ['chef-service-logistique', 'manager-logistique'].includes(user.role);
};
```

### Protection des Routes

```javascript
// Route protégée pour les BL
<Route
  path="/bons-livraison"
  element={
    <ProtectedRoute allowedRoles={['dispatcher', 'chef-service-logistique', 'manager-logistique', 'admin']}>
      <BonsLivraison />
    </ProtectedRoute>
  }
/>
```

---

## 📱 Indicateurs Visuels

### Badges de Statut de Validation

**Commandes:**
- 🔵 **Nouvelle** - Créée, pas encore soumise
- 🟠 **En attente validation** - Soumise au manager
- 🟢 **Validée** - Approuvée, prête pour BL
- 🔴 **Rejetée** - Refusée avec motif

**Bons de Livraison:**
- 🟠 **En attente validation** - Créé, attend chef service
- 🟢 **Validé** - Approuvé, mission active
- 🔴 **Rejeté** - Refusé avec motif
- 🔵 **En cours chargement** - Au dépôt
- ⚫ **Terminé** - Livraison effectuée

---

## 🔔 Système de Notifications

### Par Email
- Commande validée/rejetée
- BL validé/rejeté
- Alertes stock critique
- Rappels de maintenance

### In-App (Bell icon)
- Nouvelle commande à valider
- Nouveau BL à valider
- Mission assignée
- Alerte temps réel (déviation, retard)

### SMS (Urgent)
- Stock critique < 10%
- Déviation importante
- Incident transporteur
- Retard livraison critique

---

## 🛡️ Sécurité et Conformité

### Principe du Moindre Privilège
- Chaque utilisateur a uniquement les permissions nécessaires
- Pas d'accès par défaut
- Attribution explicite des permissions

### Traçabilité Complète
- Qui a créé la commande/BL
- Qui a validé/rejeté
- Quand (timestamp précis)
- Pourquoi (motif si applicable)

### Conformité
- RGPD : Protection des données personnelles
- ISO 27001 : Sécurité de l'information
- SOX : Traçabilité financière (pour BL/factures)

---

## 📋 Checklist d'Implémentation Backend

### À implémenter dans l'API:

- [ ] Système d'authentification JWT
- [ ] Middleware de vérification des rôles
- [ ] Endpoints de validation (commandes et BL)
- [ ] Historique des actions (audit trail)
- [ ] Notifications multi-canaux
- [ ] Gestion des motifs de rejet
- [ ] Filtrage des données selon le rôle
- [ ] Logs de sécurité
- [ ] API de gestion des permissions

---

## 💡 Exemple d'Utilisation

### Agent Commercial crée une commande

```javascript
// L'agent voit le formulaire complet
<NewCommandeForm
  canValidate={false} // Ne peut pas valider
  onSubmit={createCommande}
/>

// Après création
alert("Commande créée ! En attente de validation par votre manager.");
```

### Manager Commercial valide

```javascript
// Le manager voit le bouton de validation
<ValidationWorkflow
  commande={commande}
  currentUserRole="manager-commercial"
  onValidate={handleValidate}
  onReject={handleReject}
/>
```

### Dispatcher crée un BL

```javascript
// Voit uniquement les commandes validées
const commandesDisponibles = commandes.filter(c => c.statutValidation === 'validee');

// Crée le BL
<CreateBLForm
  commande={commandeSelectionnee}
  onSubmit={createBL}
/>

// Après création
alert("BL créé ! En attente de validation par le Chef de Service.");
```

### Chef Service valide le BL

```javascript
// Voit les BL en attente
<BLCard
  bl={bl}
  currentUserRole="chef-service-logistique"
  onValidate={handleValidateBL}
  onReject={handleRejectBL}
/>

// Après validation
sendNotificationToTransporteur(bl.transporteurId);
```

---

## 🎯 Points Clés à Retenir

1. ✅ **Séparation des rôles** : Commercial ≠ Logistique
2. ✅ **Validation obligatoire** : 2 niveaux (Commande + BL)
3. ✅ **Traçabilité complète** : Qui, Quand, Quoi, Pourquoi
4. ✅ **Référence externe** : Toujours gardée dans l'historique
5. ✅ **Commande interne** : Lien avec commande externe
6. ✅ **BL → Commande** : Historique du N° de commande
7. ✅ **Notifications** : À chaque étape du workflow
8. ✅ **Sécurité** : Vérification côté client ET serveur

---

**Date de création** : 17 février 2026  
**Version** : 1.0  
**Statut** : ✅ Spécification complète
