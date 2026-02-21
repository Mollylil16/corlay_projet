import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import TransporteurCard from '../components/transporteurs/TransporteurCard';
import TransporteurDetailsModal from '../components/transporteurs/TransporteurDetailsModal';
import { COULEURS_TRANSPORTEUR } from '../constants/couleursTransporteur';
import {
  Plus,
  Search,
  Truck,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

const Transporteurs = () => {
  const { transporteurs, createTransporteur, updateTransporteur, createCamion, updateCamion, deleteTransporteur, deleteCamion } = useApp();
  const { hasPermission } = useAuth();
  const canManageTransporteurs = hasPermission('gerer-transporteurs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransporteurId, setSelectedTransporteurId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    nom: '',
    telephone: '',
    nomContact: '',
    adresse: '',
    email: '',
    couleur: 'orange',
  });
  const [creating, setCreating] = useState(false);

  const selectedTransporteur = transporteurs.find((t) => t.id === selectedTransporteurId);
  const allCamions = transporteurs.flatMap((t) => (t.camions || []).map((c) => ({ ...c, transporteurNom: t.nom })));
  const filteredTransporteurs = transporteurs.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.nom || '').toLowerCase().includes(q) ||
      (t.nomContact || '').toLowerCase().includes(q) ||
      (t.telephone || '').toLowerCase().includes(q)
    );
  });

  const stats = {
    total: transporteurs.length,
    totalCamions: allCamions.length,
    disponibles: allCamions.filter((c) => c.statut === 'disponible').length,
    enMission: allCamions.filter((c) => c.statut === 'en-mission').length,
    maintenance: allCamions.filter((c) => c.statut === 'maintenance').length,
    tauxUtilisation: allCamions.length > 0 ? Math.round((allCamions.filter((c) => c.statut === 'en-mission').length / allCamions.length) * 100) : 0,
  };

  const handleViewDetails = (t) => {
    setSelectedTransporteurId(t.id);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.nom?.trim() || !createForm.telephone?.trim()) return;
    setCreating(true);
    try {
      await createTransporteur(createForm);
      setShowCreateModal(false);
      setCreateForm({ nom: '', telephone: '', nomContact: '', adresse: '', email: '', couleur: 'orange' });
    } catch (_) {}
    setCreating(false);
  };

  return (
    <MainLayout title="Gestion des Transporteurs" subtitle="Flotte et chauffeurs">
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Compagnies</span>
              <div className="p-2 bg-gray-100 rounded">
                <Truck className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total camions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalCamions}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Disponibles</span>
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.disponibles}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En Mission</span>
              <div className="p-2 bg-orange-100 rounded">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.enMission}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="text-sm mb-2">Taux d'utilisation</div>
            <div className="text-2xl font-bold">{stats.tauxUtilisation}%</div>
            <div className="text-xs opacity-90 mt-1">flotte active</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom compagnie, contact, téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>
            {canManageTransporteurs && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm ml-auto"
              >
                <Plus className="w-4 h-4" />
                Créer une compagnie transporteur
              </button>
            )}
          </div>
        </div>

        {/* Transporteurs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTransporteurs.length > 0 ? (
            filteredTransporteurs.map((transporteur) => (
              <TransporteurCard
                key={transporteur.id}
                transporteur={transporteur}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Aucun transporteur trouvé</p>
              <p className="text-gray-400 text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <TransporteurDetailsModal
        transporteur={selectedTransporteur}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransporteurId(null);
        }}
        onCreateCamion={createCamion}
        onUpdateTransporteur={updateTransporteur}
        onUpdateCamion={updateCamion}
        onDeleteTransporteur={deleteTransporteur}
        onDeleteCamion={deleteCamion}
        canAddCamion={canManageTransporteurs}
        canManage={canManageTransporteurs}
      />

      {/* Modal Créer une compagnie transporteur */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !creating && setShowCreateModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une compagnie transporteur</h3>
            <p className="text-sm text-gray-600 mb-4">Une compagnie peut avoir plusieurs camions. Vous pourrez ajouter la flotte après création.</p>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la compagnie (raison sociale) *</label>
                <input type="text" required value={createForm.nom} onChange={(e) => setCreateForm((f) => ({ ...f, nom: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="ex: TransCorlay SARL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input type="text" required value={createForm.telephone} onChange={(e) => setCreateForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="+225 07 00 00 00 00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                <input type="text" value={createForm.nomContact} onChange={(e) => setCreateForm((f) => ({ ...f, nomContact: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Personne à contacter" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input type="text" value={createForm.adresse} onChange={(e) => setCreateForm((f) => ({ ...f, adresse: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Adresse du siège" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="contact@compagnie.ci" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de la carte</label>
                <div className="flex flex-wrap gap-2">
                  {COULEURS_TRANSPORTEUR.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, couleur: c.id }))}
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.bg} border-2 transition-all ${
                        createForm.couleur === c.id ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-400' : 'border-transparent'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">La carte et le bouton de cette compagnie utiliseront cette couleur.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => !creating && setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">{creating ? 'Enregistrement...' : 'Créer la compagnie'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Transporteurs;
