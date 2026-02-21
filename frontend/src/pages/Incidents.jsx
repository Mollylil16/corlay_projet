import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import Modal from '../components/common/Modal';
import { api } from '../api/client';
import { AlertTriangle, Plus, Search, Filter, Clock, CheckCircle, XCircle, Eye, MessageSquare, Calendar, MapPin } from 'lucide-react';

const parseActions = (incident) => {
  const actions = incident.metadata ? (() => { try { return JSON.parse(incident.metadata); } catch { return []; } })() : [];
  return { ...incident, actions: Array.isArray(actions) ? actions : [] };
};

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get('/incidents');
        if (!cancelled) setIncidents((data || []).map(parseActions));
      } catch (e) {
        if (!cancelled) setIncidents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.vehicule?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'tous' || incident.type === filterType;
    const matchesStatut = filterStatut === 'tous' || incident.statut === filterStatut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const getSeveriteBadge = (severite) => {
    const badges = {
      critique: { color: 'bg-red-100 text-red-700', label: 'Critique' },
      moyenne: { color: 'bg-orange-100 text-orange-700', label: 'Moyenne' },
      faible: { color: 'bg-yellow-100 text-yellow-700', label: 'Faible' },
    };
    const badge = badges[severite] || badges.moyenne;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatutBadge = (statut) => {
    const badges = {
      nouveau: { color: 'bg-blue-100 text-blue-700', label: 'Nouveau' },
      'en-cours': { color: 'bg-purple-100 text-purple-700', label: 'En Cours' },
      resolu: { color: 'bg-green-100 text-green-700', label: 'Résolu' },
      ferme: { color: 'bg-gray-100 text-gray-700', label: 'Fermé' },
    };
    const badge = badges[statut] || badges.nouveau;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleCreateIncident = async (data) => {
    try {
      const actions = [{ date: new Date().toISOString(), utilisateur: 'Système', action: 'Incident créé' }];
      const created = await api.post('/incidents', {
        type: data.type,
        severite: data.severite,
        titre: data.titre,
        description: data.description,
        statut: 'nouveau',
        vehicule: data.vehicule || undefined,
        chauffeur: data.chauffeur || undefined,
        localisation: data.localisation || undefined,
        bl: data.bl || undefined,
        metadata: JSON.stringify(actions),
      });
      setIncidents((prev) => [parseActions(created), ...prev]);
      toast.success(`Incident ${created.id} créé avec succès.`);
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur lors de la création.');
    }
  };

  const handleResolveIncident = async (incidentId) => {
    try {
      const dateResolution = new Date().toISOString();
      await api.patch(`/incidents/${incidentId}/statut`, { statut: 'resolu', dateResolution });
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId
            ? { ...inc, statut: 'resolu', dateResolution, actions: [...(inc.actions || []), { date: dateResolution, utilisateur: 'Système', action: 'Incident résolu' }] }
            : inc
        )
      );
      toast.success(`Incident ${incidentId} marqué comme résolu.`);
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur.');
    }
  };

  // Stats
  const stats = {
    total: incidents.length,
    nouveaux: incidents.filter((i) => i.statut === 'nouveau').length,
    enCours: incidents.filter((i) => i.statut === 'en-cours').length,
    critiques: incidents.filter((i) => i.severite === 'critique').length,
  };

  if (loading) {
    return (
      <MainLayout title="Gestion des Incidents" subtitle="Suivez et gérez les incidents">
        <div className="p-8 text-gray-500">Chargement des incidents...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestion des Incidents" subtitle="Suivez et gérez les incidents">
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Incidents</span>
              <AlertTriangle className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Nouveaux</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.nouveaux}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En Cours</span>
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.enCours}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Critiques</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.critiques}</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher incident, véhicule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="tous">Tous les types</option>
            <option value="panne-vehicule">Panne Véhicule</option>
            <option value="retard-livraison">Retard Livraison</option>
            <option value="fuite-produit">Fuite Produit</option>
            <option value="accident">Accident</option>
            <option value="vol">Vol</option>
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="tous">Tous les statuts</option>
            <option value="nouveau">Nouveaux</option>
            <option value="en-cours">En Cours</option>
            <option value="resolu">Résolus</option>
            <option value="ferme">Fermés</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nouvel Incident
          </button>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun incident</h3>
              <p className="text-gray-600">Tout fonctionne normalement</p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{incident.id}</h4>
                      {getSeveriteBadge(incident.severite)}
                      {getStatutBadge(incident.statut)}
                    </div>
                    <h5 className="text-md font-semibold text-gray-800 mb-2">{incident.titre}</h5>
                    <p className="text-sm text-gray-600 mb-3">{incident.description}</p>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="w-4 h-4" />
                          {new Date(incident.dateIncident).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      {incident.vehicule && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Véhicule</p>
                          <p className="font-semibold text-gray-900">{incident.vehicule}</p>
                        </div>
                      )}
                      {incident.chauffeur && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Chauffeur</p>
                          <p className="font-semibold text-gray-900">{incident.chauffeur}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Localisation</p>
                        <div className="flex items-center gap-1 text-gray-900">
                          <MapPin className="w-4 h-4" />
                          {incident.localisation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                  {incident.statut !== 'resolu' && incident.statut !== 'ferme' && (
                    <button
                      onClick={() => handleResolveIncident(incident.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marquer Résolu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Nouvel Incident"
            size="lg"
          >
            <IncidentForm onSubmit={handleCreateIncident} onCancel={() => setIsCreateModalOpen(false)} />
          </Modal>
        )}

        {/* Details Modal */}
        {selectedIncident && (
          <Modal
            isOpen={!!selectedIncident}
            onClose={() => setSelectedIncident(null)}
            title={`Détails: ${selectedIncident.id}`}
            size="lg"
          >
            <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
          </Modal>
        )}
      </div>
    </MainLayout>
  );
};

// Formulaire Incident
const IncidentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'panne-vehicule',
    severite: 'moyenne',
    titre: '',
    description: '',
    vehicule: '',
    chauffeur: '',
    localisation: '',
    bl: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titre || !formData.description) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="panne-vehicule">Panne Véhicule</option>
            <option value="retard-livraison">Retard Livraison</option>
            <option value="fuite-produit">Fuite Produit</option>
            <option value="accident">Accident</option>
            <option value="vol">Vol</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sévérité <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.severite}
            onChange={(e) => setFormData({ ...formData, severite: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="critique">Critique</option>
            <option value="moyenne">Moyenne</option>
            <option value="faible">Faible</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.titre}
          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
          placeholder="Ex: Panne moteur sur TRK-002"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Détails de l'incident..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Véhicule</label>
          <input
            type="text"
            value={formData.vehicule}
            onChange={(e) => setFormData({ ...formData, vehicule: e.target.value })}
            placeholder="TRK-001"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chauffeur</label>
          <input
            type="text"
            value={formData.chauffeur}
            onChange={(e) => setFormData({ ...formData, chauffeur: e.target.value })}
            placeholder="Nom du chauffeur"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
        <input
          type="text"
          value={formData.localisation}
          onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
          placeholder="Ex: Autoroute du Nord, Km 15"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          Créer l'Incident
        </button>
      </div>
    </form>
  );
};

// Détails Incident
const IncidentDetails = ({ incident, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {incident.severite === 'critique' && <AlertTriangle className="w-8 h-8 text-red-500" />}
        <div>
          <h3 className="text-xl font-bold text-gray-900">{incident.titre}</h3>
          <p className="text-sm text-gray-600">{incident.id}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">{incident.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Date & Heure</p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(incident.dateIncident).toLocaleString('fr-FR')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Statut</p>
          <div className="text-sm font-semibold">{incident.statut}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-3">Historique des Actions</h4>
        <div className="space-y-3">
          {incident.actions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{action.action}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {action.utilisateur} • {new Date(action.date).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
      >
        Fermer
      </button>
    </div>
  );
};

export default Incidents;
