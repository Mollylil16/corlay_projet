import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import Modal from '../components/common/Modal';
import { 
  Package, 
  Truck, 
  TrendingDown, 
  Check, 
  Star,
  MapPin,
  Clock,
  DollarSign,
  Activity,
  Route,
  Save,
} from 'lucide-react';

/** Parse capacité (ex. "32,000 L") en litres (number). */
function parseCapaciteLitres(capacite) {
  if (capacite == null || capacite === '') return 0;
  const cleaned = String(capacite).replace(/\s/g, '').replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  return Number.isNaN(num) ? 0 : num;
}

const ExpeditionDnD = () => {
  const {
    commandes,
    camions: camionsApi,
    bonsLivraison,
    createTournee,
    tournees,
    getTournee,
    updateTournee,
    updateBonLivraison,
    refetch,
  } = useApp();

  const commandesAvecBl = new Set((bonsLivraison || []).map((bl) => bl.numeroCommande));
  const commandesADispatcher = commandes.filter(
    (cmd) => cmd.statut === 'validee' && !commandesAvecBl.has(cmd.id)
  );

  const transporteurs = (camionsApi || []).map((c) => {
    const capaciteLitres = (c.compartiments || []).reduce((s, comp) => s + (comp.capaciteLitres || 0), 0);
    return {
      id: c.id,
      immatriculation: c.immatriculation || c.id,
      chauffeur: c.chauffeur || '-',
      capacite: capaciteLitres > 0 ? `${capaciteLitres.toLocaleString('fr-FR')} L` : '-',
      capaciteLitres,
      type: 'Citerne',
      statut: c.statut === 'disponible' ? 'Disponible' : c.statut === 'en-mission' ? 'En mission' : c.statut === 'maintenance' ? 'Maintenance' : 'Disponible',
      position: (c.transporteur && c.transporteur.nom) ? c.transporteur.nom : '—',
      coutEstime: null,
      ponctualite: c.ponctualite != null ? Number(c.ponctualite) : null,
      isRecommended: c.statut === 'disponible',
    };
  });

  const [activeId, setActiveId] = useState(null);
  const [selectedCommandeIds, setSelectedCommandeIds] = useState([]);
  const [selectedTransporteur, setSelectedTransporteur] = useState(null);
  const [creatingTournee, setCreatingTournee] = useState(false);
  const [tourneeEtaModalId, setTourneeEtaModalId] = useState(null);
  const [tourneeDetail, setTourneeDetail] = useState(null);
  const [savingEta, setSavingEta] = useState(false);
  const [etaForm, setEtaForm] = useState({ dateDepartPrevue: '', heureDepartPrevue: '', bls: {} });

  useEffect(() => {
    if (!tourneeEtaModalId) {
      setTourneeDetail(null);
      return;
    }
    let cancelled = false;
    getTournee(tourneeEtaModalId)
      .then((t) => {
        if (!cancelled && t) {
          setTourneeDetail(t);
          const today = new Date().toISOString().split('T')[0];
          setEtaForm({
            dateDepartPrevue: t.dateDepartPrevue || today,
            heureDepartPrevue: t.heureDepartPrevue || '08:00',
            bls: (t.bonsLivraison || []).reduce((acc, bl) => {
              acc[bl.id] = {
                dureeTrajetMinutes: bl.dureeTrajetMinutes ?? '',
                dureeDechargementMinutes: bl.dureeDechargementMinutes ?? '',
              };
              return acc;
            }, {}),
          });
        }
      })
      .catch(() => setTourneeDetail(null));
    return () => { cancelled = true; };
  }, [tourneeEtaModalId, getTournee]);

  const totalVolumeSelection = commandesADispatcher
    .filter((c) => selectedCommandeIds.includes(c.id))
    .reduce((sum, c) => sum + (c.quantite || 0), 0);

  const transporteursDisponibles = transporteurs.filter((t) => t.statut === 'Disponible');
  const transporteursCompatibles = transporteursDisponibles.filter(
    (t) => t.capaciteLitres >= totalVolumeSelection && totalVolumeSelection > 0
  );

  // Stats
  const stats = [
    {
      icon: Package,
      label: 'Commandes à Dispatcher',
      value: commandesADispatcher.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Truck,
      label: 'Camions disponibles',
      value: transporteurs.filter((t) => t.statut === 'Disponible').length,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Activity,
      label: 'Missions en Cours',
      value: transporteurs.filter((t) => t.statut === 'En mission').length,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: TrendingDown,
      label: 'Économies Réalisées',
      value: '—',
      suffix: '',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const commande = commandesADispatcher.find((c) => c.id === active.id);
      const camionCard = transporteurs.find((t) => t.id === over.id);
      if (commande && camionCard && camionCard.statut === 'Disponible') {
        handleCreateTournee(camionCard.id, [commande.id]);
      } else if (commande && camionCard) {
        toast.error('Ce camion n\'est pas disponible !');
      }
    }
    setActiveId(null);
  };

  const toggleCommandeSelection = (commandeId) => {
    setSelectedCommandeIds((prev) =>
      prev.includes(commandeId) ? prev.filter((id) => id !== commandeId) : [...prev, commandeId]
    );
  };

  const handleCreateTournee = async () => {
    if (selectedCommandeIds.length === 0 || !selectedTransporteur) {
      toast.warning('Sélectionnez au moins une commande et un camion.');
      return;
    }
    const transporteur = transporteurs.find((t) => t.id === selectedTransporteur);
    if (transporteur && transporteur.capaciteLitres < totalVolumeSelection) {
      toast.error('Le volume total dépasse la capacité du camion. Choisissez un camion plus grand ou moins de commandes.');
      return;
    }
    setCreatingTournee(true);
    try {
      const { tournee } = await createTournee(selectedTransporteur, selectedCommandeIds); // selectedTransporteur = id du camion
      setSelectedCommandeIds([]);
      setSelectedTransporteur(null);
      if (tournee?.id) setTourneeEtaModalId(tournee.id);
    } finally {
      setCreatingTournee(false);
    }
  };

  const handleSaveEta = async () => {
    if (!tourneeEtaModalId || !tourneeDetail) return;
    setSavingEta(true);
    try {
      await updateTournee(tourneeEtaModalId, {
        dateDepartPrevue: etaForm.dateDepartPrevue || undefined,
        heureDepartPrevue: etaForm.heureDepartPrevue || undefined,
      });
      for (const bl of tourneeDetail.bonsLivraison || []) {
        const f = etaForm.bls[bl.id];
        if (f && (f.dureeTrajetMinutes !== '' || f.dureeDechargementMinutes !== '')) {
          await updateBonLivraison(bl.id, {
            dureeTrajetMinutes: f.dureeTrajetMinutes === '' ? undefined : Number(f.dureeTrajetMinutes),
            dureeDechargementMinutes: f.dureeDechargementMinutes === '' ? undefined : Number(f.dureeDechargementMinutes),
          });
        }
      }
      await refetch();
      const updated = await getTournee(tourneeEtaModalId);
      setTourneeDetail(updated);
      setEtaForm((prev) => ({
        ...prev,
        bls: (updated?.bonsLivraison || []).reduce((acc, bl) => {
          acc[bl.id] = {
            dureeTrajetMinutes: bl.dureeTrajetMinutes ?? '',
            dureeDechargementMinutes: bl.dureeDechargementMinutes ?? '',
          };
          return acc;
        }, {}),
      }));
      toast.success('Heures de départ et durées enregistrées. Les ETA sont recalculés.');
    } catch (_) {
      // toast géré dans updateTournee / updateBonLivraison
    } finally {
      setSavingEta(false);
    }
  };

  const tourneesEnCours = (tournees || []).filter(
    (t) => t.statut === 'planifiee' || t.statut === 'en-cours'
  );

  return (
    <MainLayout
      title="Expédition & Dispatching"
      subtitle="Regroupez plusieurs commandes sur un même camion (selon destination et capacité)"
    >
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                    {stat.suffix && <span className="text-lg ml-1">{stat.suffix}</span>}
                  </p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barre création de tournée (multi-commandes → 1 camion) */}
        {(selectedCommandeIds.length > 0 || selectedTransporteur) && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedCommandeIds.length > 0
                      ? `${selectedCommandeIds.length} commande(s) · ${totalVolumeSelection.toLocaleString('fr-FR')} L total`
                      : 'Cochez les commandes à regrouper'}
                  </span>
                </div>
                <div className="text-2xl">→</div>
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedTransporteur
                      ? transporteurs.find((t) => t.id === selectedTransporteur)?.immatriculation || 'Camion'
                      : 'Sélectionnez un camion'}
                  </span>
                </div>
                {selectedTransporteur && totalVolumeSelection > 0 && (
                  <span
                    className={
                      transporteursCompatibles.some((t) => t.id === selectedTransporteur)
                        ? 'bg-green-500/80 px-3 py-1 rounded text-xs font-bold'
                        : 'bg-red-500/80 px-3 py-1 rounded text-xs font-bold'
                    }
                  >
                    {transporteursCompatibles.some((t) => t.id === selectedTransporteur)
                      ? 'Capacité OK'
                      : 'Capacité insuffisante'}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCommandeIds([]);
                    setSelectedTransporteur(null);
                  }}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateTournee}
                  disabled={
                    creatingTournee ||
                    selectedCommandeIds.length === 0 ||
                    !selectedTransporteur ||
                    (transporteurs.find((t) => t.id === selectedTransporteur)?.capaciteLitres ?? 0) < totalVolumeSelection
                  }
                  className="px-6 py-2 bg-white text-orange-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  {creatingTournee ? 'Création…' : 'Créer la tournée'}
                </button>
              </div>
            </div>
          </div>
        )}

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Colonne des Commandes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Commandes à Dispatcher ({commandesADispatcher.length})
              </h3>
              <div className="space-y-3">
                {commandesADispatcher.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
                    Aucune commande à dispatcher. Créez des commandes puis validez-les (Trésorerie → Facturation) pour qu’elles apparaissent ici.
                  </div>
                ) : commandesADispatcher.map((commande) => (
                  <CommandeCard
                    key={commande.id}
                    commande={commande}
                    isSelected={selectedCommandeIds.includes(commande.id)}
                    onToggle={() => toggleCommandeSelection(commande.id)}
                    onClick={() => toggleCommandeSelection(commande.id)}
                  />
                ))}
              </div>
            </div>

            {/* Colonne des Transporteurs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Camions disponibles ({transporteurs.filter((t) => t.statut === 'Disponible').length})
              </h3>
              <div className="space-y-3">
                {transporteurs.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
                    Aucun camion. Créez une <strong>compagnie transporteur</strong> puis ajoutez des camions (flotte) depuis son profil.
                  </div>
                ) : transporteurs.map((transporteur) => (
                  <TransporteurCard
                    key={transporteur.id}
                    transporteur={transporteur}
                    isSelected={selectedTransporteur === transporteur.id}
                    isCompatible={
                      transporteur.statut === 'Disponible' &&
                      totalVolumeSelection > 0 &&
                      transporteur.capaciteLitres >= totalVolumeSelection
                    }
                    onClick={() => setSelectedTransporteur(transporteur.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-orange-500 opacity-90">
                Déplacement en cours...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Tournées en cours — Itinéraire & ETA */}
        {tourneesEnCours.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-orange-600" />
              Tournées en cours
            </h3>
            <div className="flex flex-wrap gap-3">
              {tourneesEnCours.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTourneeEtaModalId(t.id)}
                  className="px-4 py-2 bg-white border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 font-medium text-gray-800 transition-colors"
                >
                  {t.id} — Itinéraire & ETA
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Itinéraire & ETA */}
        <Modal
          isOpen={!!tourneeEtaModalId}
          onClose={() => setTourneeEtaModalId(null)}
          title="Itinéraire & estimations d'arrivée"
          size="xl"
        >
          {tourneeDetail && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Saisissez l'heure de départ et les durées (trajet + déchargement) pour chaque livraison. L'heure d'arrivée prévue chez chaque client est calculée automatiquement (trajet + déchargement des stops précédents).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                  <input
                    type="date"
                    value={etaForm.dateDepartPrevue}
                    onChange={(e) => setEtaForm((p) => ({ ...p, dateDepartPrevue: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de départ</label>
                  <input
                    type="time"
                    value={etaForm.heureDepartPrevue}
                    onChange={(e) => setEtaForm((p) => ({ ...p, heureDepartPrevue: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2">Ordre</th>
                      <th className="text-left py-2 px-2">Client</th>
                      <th className="text-left py-2 px-2">Durée trajet (min)</th>
                      <th className="text-left py-2 px-2">Durée déchargement (min)</th>
                      <th className="text-left py-2 px-2">Heure arrivée prévue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tourneeDetail.bonsLivraison || [])
                      .slice()
                      .sort((a, b) => (a.ordrePassage ?? 999) - (b.ordrePassage ?? 999))
                      .map((bl) => (
                        <tr key={bl.id} className="border-b">
                          <td className="py-2 px-2 font-medium">{bl.ordrePassage ?? '—'}</td>
                          <td className="py-2 px-2">{bl.client}</td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={0}
                              value={etaForm.bls[bl.id]?.dureeTrajetMinutes ?? ''}
                              onChange={(e) =>
                                setEtaForm((p) => ({
                                  ...p,
                                  bls: {
                                    ...p.bls,
                                    [bl.id]: {
                                      ...p.bls[bl.id],
                                      dureeTrajetMinutes: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                                    },
                                  },
                                }))
                              }
                              placeholder="ex. 120"
                              className="w-20 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min={0}
                              value={etaForm.bls[bl.id]?.dureeDechargementMinutes ?? ''}
                              onChange={(e) =>
                                setEtaForm((p) => ({
                                  ...p,
                                  bls: {
                                    ...p.bls,
                                    [bl.id]: {
                                      ...p.bls[bl.id],
                                      dureeDechargementMinutes: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                                    },
                                  },
                                }))
                              }
                              placeholder="ex. 120"
                              className="w-20 border border-gray-300 rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-2 px-2 font-medium text-green-700">
                            {bl.heureArriveePrevue ?? '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTourneeEtaModalId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveEta}
                  disabled={savingEta}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingEta ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}
          {tourneeEtaModalId && !tourneeDetail && (
            <p className="text-gray-500">Chargement de la tournée…</p>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

// Composant Carte de Commande
const CommandeCard = ({ commande, isSelected, onToggle, onClick }) => {
  const priorityColors = {
    critique: 'bg-red-100 text-red-800 border-red-300',
    urgent: 'bg-orange-100 text-orange-800 border-orange-300',
    normale: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{commande.id}</div>
            <div className="text-xs text-gray-500 mt-1">{commande.client}</div>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-bold uppercase rounded border ${
            priorityColors[commande.priorite] || 'bg-gray-100 text-gray-800 border-gray-300'
          }`}
        >
          {commande.priorite}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="w-4 h-4" />
          <span>{commande.type} – {commande.quantite?.toLocaleString?.() ?? 0} L</span>
        </div>
        {commande.destination && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{commande.destination}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{commande.date}</span>
        </div>
      </div>
    </div>
  );
};

// Composant Carte de Transporteur
const TransporteurCard = ({ transporteur, isSelected, isCompatible, onClick }) => {
  const isAvailable = transporteur.statut === 'Disponible';

  return (
    <div
      onClick={isAvailable ? onClick : undefined}
      className={`bg-white rounded-lg p-4 border-2 transition-all ${
        isAvailable ? 'cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed'
      } ${isSelected ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-200'}`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {isCompatible && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
            <Check className="w-3 h-3" />
            Compatible
          </span>
        )}
        {transporteur.isRecommended && !isCompatible && (
          <span className="inline-flex items-center gap-2 text-orange-600">
            <Star className="w-4 h-4 fill-orange-600" />
            <span className="text-xs font-bold uppercase">Disponible</span>
          </span>
        )}
      </div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-gray-900">{transporteur.immatriculation}</div>
          <div className="text-xs text-gray-500 mt-1">{transporteur.chauffeur}</div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-bold rounded ${
            isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {transporteur.statut}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Truck className="w-4 h-4" />
          <span>{transporteur.capacite}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{transporteur.position}</span>
        </div>
        {transporteur.coutEstime != null && (
          <div className="flex items-center gap-2 text-green-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">{transporteur.coutEstime.toLocaleString('fr-FR')} FCFA</span>
          </div>
        )}
        {transporteur.ponctualite != null && (
          <div className="flex items-center gap-2 text-blue-600">
            <Activity className="w-4 h-4" />
            <span>Ponctualité {transporteur.ponctualite}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpeditionDnD;
