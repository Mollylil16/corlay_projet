import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};

// Mapper véhicule API -> frontend (position [lat, lng])
function mapVehicle(v) {
  return {
    ...v,
    position: [v.positionLat, v.positionLng],
  };
}

// Mapper dépôts API -> format stocks frontend
function mapStocks(depots) {
  return { depots: depots || [] };
}

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [stocks, setStocks] = useState({ depots: [] });
  const [transporteurs, setTransporteurs] = useState([]);
  const [camions, setCamions] = useState([]);
  const [tournees, setTournees] = useState([]);
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [relevesPSL, setRelevesPSL] = useState([]);
  const [commandesAchat, setCommandesAchat] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [veh, cmd, depots, trans, cam, tour, bl, rel, ach, al] = await Promise.all([
        api.get('/vehicles'),
        api.get('/commandes'),
        api.get('/depots'),
        api.get('/transporteurs'),
        api.get('/camions').catch(() => []),
        api.get('/tournees').catch(() => []),
        api.get('/bons-livraison'),
        api.get('/releves-psl').catch(() => []),
        api.get('/commandes-achat').catch(() => []),
        api.get('/alertes'),
      ]);
      setVehicles((veh || []).map(mapVehicle));
      setCommandes(cmd || []);
      setStocks(mapStocks(depots));
      setTransporteurs(trans || []);
      setCamions(cam || []);
      setTournees(tour || []);
      setBonsLivraison(bl || []);
      setRelevesPSL(rel || []);
      setCommandesAchat(ach || []);
      setAlertes(al || []);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(err?.message || 'Erreur de chargement');
      toast.error('Impossible de charger les données. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // KPIs dérivés des données
  const today = new Date().toISOString().split('T')[0];
  const commandesDuJour = commandes.filter((c) => c.date === today).length;
  const volumeLivre = bonsLivraison
    .filter((b) => b.statut === 'livré' && b.quantiteLivree)
    .reduce((sum, b) => sum + (b.quantiteLivree || 0), 0);
  const missionsEnCours = vehicles.filter((v) => v.status === 'transit').length;
  const totalLivrees = commandes.filter((c) => c.statut === 'livree').length;
  const tauxService = commandes.length ? Math.round((totalLivrees / commandes.length) * 100) : 0;

  const kpis = {
    commandesDuJour: { value: commandesDuJour, trend: 0, isPositive: true },
    volumeLivre: { value: volumeLivre, trend: 0, isPositive: true },
    missionsEnCours: { value: missionsEnCours, trend: 0, isPositive: false },
    tauxService: { value: tauxService, trend: 0, isPositive: true },
  };

  const addCommande = async (commande) => {
    try {
      const created = await api.post('/commandes', {
        client: commande.client,
        type: commande.type,
        quantite: commande.quantite,
        priorite: commande.priorite || 'normale',
        typeCommande: commande.typeCommande || 'externe',
        referenceCommandeExterne: commande.referenceCommandeExterne || undefined,
        destination: commande.destination?.trim() || undefined,
      });
      setCommandes((prev) => [created, ...prev]);
      toast.success('Commande créée. En attente de validation Trésorerie.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur création commande');
      throw err;
    }
  };

  const validationTresorerie = async (commandeId, data) => {
    try {
      const updated = await api.patch(`/commandes/${commandeId}/validation-tresorerie`, {
        paiementRecu: data.paiementRecu,
        moyenPaiement: data.moyenPaiement || undefined,
        numeroCheque: data.numeroCheque || undefined,
        numeroTransactionVirement: data.numeroTransactionVirement || undefined,
      });
      setCommandes((prev) => prev.map((c) => (c.id === commandeId ? updated : c)));
      toast.success('Paiement validé par la Trésorerie. Envoi à la Facturation.');
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur validation trésorerie');
      throw err;
    }
  };

  const validationFacturation = async (commandeId, numeroBonCommandeInterne) => {
    try {
      const updated = await api.patch(`/commandes/${commandeId}/validation-facturation`, {
        numeroBonCommandeInterne: String(numeroBonCommandeInterne || '').trim(),
      });
      setCommandes((prev) => prev.map((c) => (c.id === commandeId ? updated : c)));
      toast.success('Bon de commande interne enregistré. Commande disponible pour la Logistique.');
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur validation facturation');
      throw err;
    }
  };

  const updateCommandeStatus = async (id, newStatus) => {
    try {
      await api.patch(`/commandes/${id}/statut`, { statut: newStatus });
      setCommandes((prev) => prev.map((c) => (c.id === id ? { ...c, statut: newStatus } : c)));
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour statut');
      throw err;
    }
  };

  const updateVehiclePosition = async (id, newPosition) => {
    try {
      const [lat, lng] = Array.isArray(newPosition) ? newPosition : [newPosition?.lat, newPosition?.lng];
      await api.patch(`/vehicles/${id}/position`, { positionLat: lat, positionLng: lng });
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, position: [lat, lng], positionLat: lat, positionLng: lng } : v))
      );
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour position');
      throw err;
    }
  };

  const updateVehicleStatus = async (id, newStatus) => {
    try {
      await api.patch(`/vehicles/${id}/status`, { status: newStatus });
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour statut');
      throw err;
    }
  };

  const adjustStock = async (depotId, tankId, newPercentage) => {
    try {
      await api.patch(`/depots/${depotId}/tanks/${tankId}`, { percentage: newPercentage });
      setStocks((prev) => ({
        ...prev,
        depots: prev.depots.map((depot) =>
          depot.id === depotId
            ? {
                ...depot,
                tanks: depot.tanks.map((tank) =>
                  tank.id === tankId
                    ? {
                        ...tank,
                        percentage: newPercentage,
                        current: Math.round((newPercentage / 100) * tank.capacity),
                      }
                    : tank
                ),
              }
            : depot
        ),
      }));
      toast.success('Stock mis à jour');
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur ajustement stock');
      throw err;
    }
  };

  const createDepot = async (data) => {
    try {
      const payload = {
        nom: data.nom,
        statut: data.statut || 'operationnel',
        tanks: (data.tanks || []).map((t) => ({
          tankNumber: t.tankNumber || 'TANK 01',
          name: t.name,
          type: t.type || 'diesel',
          capacity: Number(t.capacity) || 100000,
          percentage: Math.min(100, Math.max(0, Number(t.percentage) ?? 0)),
        })),
      };
      const created = await api.post('/depots', payload);
      setStocks((prev) => ({
        ...prev,
        depots: [...(prev.depots || []), created].sort((a, b) => (a.nom || '').localeCompare(b.nom || '')),
      }));
      toast.success('Dépôt créé.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur création dépôt');
      throw err;
    }
  };

  const addBonLivraison = async (bon) => {
    try {
      const created = await api.post('/bons-livraison', {
        numeroCommande: bon.numeroCommande,
        client: bon.client,
        chauffeur: bon.chauffeur,
        vehicule: bon.vehicule,
        typeCarburant: bon.typeCarburant,
        quantiteCommandee: bon.quantiteCommandee,
        quantiteLivree: bon.quantiteLivree ?? undefined,
        dateEmission: bon.dateEmission || new Date().toISOString().split('T')[0],
        heureDepart: bon.heureDepart || undefined,
        statut: bon.statut || 'en-attente',
        signature: bon.signature ?? false,
        observations: bon.observations || undefined,
      });
      setBonsLivraison((prev) => [created, ...prev]);
      toast.success('Bon de Livraison créé.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur création BL');
      throw err;
    }
  };

  const updateBonLivraisonStatus = async (id, newStatus) => {
    try {
      await api.patch(`/bons-livraison/${id}/statut`, { statut: newStatus });
      setBonsLivraison((prev) => prev.map((b) => (b.id === id ? { ...b, statut: newStatus } : b)));
      toast.success('Statut du bon mis à jour');
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour BL');
      throw err;
    }
  };

  const updateBonLivraison = async (id, data) => {
    try {
      const updated = await api.patch(`/bons-livraison/${id}`, data);
      setBonsLivraison((prev) => prev.map((b) => (b.id === id ? updated : b)));
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour BL');
      throw err;
    }
  };

  const getTournee = (id) => api.get(`/tournees/${id}`);

  const updateTournee = async (id, data) => {
    try {
      const updated = await api.patch(`/tournees/${id}`, data);
      setTournees((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour tournée');
      throw err;
    }
  };

  const addAlerte = async (alerte) => {
    try {
      const created = await api.post('/alertes', {
        type: alerte.type,
        severite: alerte.severite || 'info',
        titre: alerte.titre,
        message: alerte.message,
        vehicule: alerte.vehicule || undefined,
        depot: alerte.depot || undefined,
        lu: false,
      });
      setAlertes((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur création alerte');
      throw err;
    }
  };

  const markAlerteAsRead = async (id) => {
    try {
      await api.patch(`/alertes/${id}/lu`);
      setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, lu: true } : a)));
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur');
      throw err;
    }
  };

  const createTransporteur = async (data) => {
    try {
      const created = await api.post('/transporteurs', {
        nom: data.nom,
        telephone: data.telephone,
        nomContact: data.nomContact || undefined,
        adresse: data.adresse || undefined,
        email: data.email || undefined,
        couleur: data.couleur || undefined,
      });
      setTransporteurs((prev) => [created, ...prev]);
      toast.success('Compagnie transporteur enregistrée. Vous pouvez maintenant ajouter des camions.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur enregistrement');
      throw err;
    }
  };

  const deleteTransporteur = async (id) => {
    try {
      await api.delete(`/transporteurs/${id}`);
      setTransporteurs((prev) => prev.filter((t) => t.id !== id));
      setCamions((prev) => prev.filter((c) => c.transporteurId !== id));
      toast.success('Compagnie supprimée.');
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de supprimer la compagnie');
      throw err;
    }
  };

  const deleteCamion = async (id) => {
    try {
      await api.delete(`/camions/${id}`);
      await fetchAll();
      toast.success('Camion supprimé.');
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de supprimer le camion');
      throw err;
    }
  };

  const createCamion = async (data) => {
    try {
      const created = await api.post('/camions', {
        transporteurId: data.transporteurId,
        immatriculation: data.immatriculation,
        marque: data.marque || undefined,
        couleur: data.couleur || undefined,
        statut: data.statut || 'disponible',
        chauffeur: data.chauffeur || undefined,
        telephoneChauffeur: data.telephoneChauffeur || undefined,
        compartiments: (data.compartiments || []).map((c, i) => ({ ordre: i + 1, capaciteLitres: Number(c.capaciteLitres) || 0 })),
      });
      await fetchAll();
      toast.success('Camion enregistré.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur enregistrement camion');
      throw err;
    }
  };

  const updateTransporteur = async (id, data) => {
    try {
      const updated = await api.patch(`/transporteurs/${id}`, data);
      setTransporteurs((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('Compagnie mise à jour.');
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour transporteur');
      throw err;
    }
  };

  const updateCamion = async (id, data) => {
    try {
      const updated = await api.patch(`/camions/${id}`, data);
      await fetchAll();
      toast.success('Camion mis à jour.');
      return updated;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur mise à jour camion');
      throw err;
    }
  };

  const getStockTheoriqueActuel = () => api.get('/releves-psl/stock-theorique');

  const addRelevePSL = async (data) => {
    try {
      const created = await api.post('/releves-psl', data);
      setRelevesPSL((prev) => [created, ...prev]);
      toast.success('Relevé stock commun enregistré. Comparez l\'écart avec le stock théorique.');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur enregistrement relevé');
      throw err;
    }
  };

  const addCommandeAchat = async (data) => {
    try {
      const created = await api.post('/commandes-achat', data);
      setCommandesAchat((prev) => [created, ...prev]);
      toast.success('Commande d\'achat enregistrée (commandé vs reçu).');
      return created;
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur enregistrement commande d\'achat');
      throw err;
    }
  };

  const createTournee = async (camionId, commandeIds) => {
    try {
      const { tournee, bonsLivraison } = await api.post('/tournees', {
        camionId,
        commandeIds,
      });
      await fetchAll();
      toast.success(
        `Tournée créée : ${bonsLivraison?.length ?? 0} livraison(s) assignée(s) au camion.`
      );
      return { tournee, bonsLivraison };
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur création tournée');
      throw err;
    }
  };

  const value = {
    vehicles,
    commandes,
    stocks,
    kpis,
    transporteurs,
    camions,
    bonsLivraison,
    alertes,
    loading,
    error,
    refetch: fetchAll,
    setVehicles,
    setCommandes,
    setStocks,
    setTransporteurs,
    setBonsLivraison,
    setAlertes,
    addCommande,
    validationTresorerie,
    validationFacturation,
    updateCommandeStatus,
    updateVehiclePosition,
    updateVehicleStatus,
    adjustStock,
    createDepot,
    addBonLivraison,
    updateBonLivraisonStatus,
    updateBonLivraison,
    tournees,
    getTournee,
    updateTournee,
    relevesPSL,
    commandesAchat,
    getStockTheoriqueActuel,
    addRelevePSL,
    addCommandeAchat,
    addAlerte,
    markAlerteAsRead,
    createTransporteur,
    updateTransporteur,
    deleteTransporteur,
    createCamion,
    updateCamion,
    deleteCamion,
    createTournee,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
