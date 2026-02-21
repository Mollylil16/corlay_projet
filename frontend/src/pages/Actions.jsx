import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import ActionCard from '../components/actions/ActionCard';
import { Plus, Filter, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const STATUT_ORDER = ['a-faire', 'en-cours', 'terminee'];

const Actions = () => {
  const { alertes, markAlerteAsRead, addAlerte } = useApp();
  const [enCoursIds, setEnCoursIds] = useState([]);
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [form, setForm] = useState({ titre: '', message: '', type: 'autre', severite: 'info' });

  const getStatut = (alerte) => {
    if (enCoursIds.includes(alerte.id)) return 'en-cours';
    if (alerte.lu) return 'terminee';
    return 'a-faire';
  };

  const actionsFromAlertes = alertes.map((alerte) => ({
    id: alerte.id,
    titre: alerte.titre,
    description: alerte.message,
    statut: getStatut(alerte),
    priorite: alerte.severite === 'critique' ? 'haute' : alerte.severite === 'urgent' ? 'haute' : alerte.severite === 'attention' ? 'moyenne' : 'basse',
    responsable: 'Équipe Dispatch',
    dateEcheance: 'Aujourd\'hui',
    categorie: alerte.type === 'stock' ? 'Stock' : alerte.type === 'retard' ? 'Livraison' : alerte.type === 'maintenance' ? 'Maintenance' : 'Autre',
  }));

  const columns = [
    { id: 'a-faire', label: 'À faire', color: 'bg-blue-50 border-blue-200' },
    { id: 'en-cours', label: 'En cours', color: 'bg-orange-50 border-orange-200' },
    { id: 'terminee', label: 'Terminées', color: 'bg-green-50 border-green-200' },
  ];

  const getActionsByStatut = (statut) => actionsFromAlertes.filter((a) => a.statut === statut);

  const handleMove = async (action, newStatut) => {
    if (newStatut === 'terminee') {
      try {
        await markAlerteAsRead(action.id);
        setEnCoursIds((prev) => prev.filter((id) => id !== action.id));
        toast.success('Action marquée comme terminée.');
      } catch (_) {}
      return;
    }
    if (newStatut === 'en-cours') {
      setEnCoursIds((prev) => (prev.includes(action.id) ? prev : [...prev, action.id]));
      return;
    }
    if (newStatut === 'a-faire') {
      setEnCoursIds((prev) => prev.filter((id) => id !== action.id));
      return;
    }
  };

  const onMoveLeft = (action) => {
    const idx = STATUT_ORDER.indexOf(action.statut);
    if (idx > 0) handleMove(action, STATUT_ORDER[idx - 1]);
  };

  const onMoveRight = (action) => {
    const idx = STATUT_ORDER.indexOf(action.statut);
    if (idx < STATUT_ORDER.length - 1) handleMove(action, STATUT_ORDER[idx + 1]);
  };

  const handleToggleAction = async (action) => {
    if (action.statut === 'terminee') return;
    try {
      await markAlerteAsRead(action.id);
      setEnCoursIds((prev) => prev.filter((id) => id !== action.id));
      toast.success('Action marquée comme terminée.');
    } catch (_) {}
  };

  const handleSubmitNewAction = async (e) => {
    e.preventDefault();
    if (!form.titre.trim()) {
      toast.warning('Veuillez saisir un titre.');
      return;
    }
    try {
      await addAlerte({
        type: form.type,
        severite: form.severite,
        titre: form.titre.trim(),
        message: form.message.trim() || form.titre.trim(),
      });
      toast.success('Nouvelle action créée.');
      setForm({ titre: '', message: '', type: 'autre', severite: 'info' });
      setShowNewActionModal(false);
    } catch (_) {}
  };

  const stats = {
    total: actionsFromAlertes.length,
    aFaire: getActionsByStatut('a-faire').length,
    enCours: getActionsByStatut('en-cours').length,
    terminees: getActionsByStatut('terminee').length,
  };

  return (
    <MainLayout title="Actions & Tâches" subtitle="Gestion des activités et suivi">
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <Filter className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">À faire</span>
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.aFaire}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En cours</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.enCours}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Terminées</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.terminees}</div>
          </div>
        </div>

        {/* Header + Bouton Nouvelle action */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-semibold text-gray-900">Tableau des actions (Kanban)</h2>
          <button
            type="button"
            onClick={() => setShowNewActionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Action
          </button>
        </div>

        {/* Kanban: 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.id} className={`rounded-xl border-2 ${col.color} p-4 min-h-[320px]`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{col.label}</h3>
                <span className="text-sm text-gray-500">({getActionsByStatut(col.id).length})</span>
              </div>
              <div className="space-y-3">
                {getActionsByStatut(col.id).map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onToggle={handleToggleAction}
                    onMoveLeft={col.id !== 'a-faire' ? onMoveLeft : undefined}
                    onMoveRight={col.id !== 'terminee' ? onMoveRight : undefined}
                  />
                ))}
                {getActionsByStatut(col.id).length === 0 && (
                  <p className="text-sm text-gray-400 italic py-4 text-center">Aucune action</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nouvelle action */}
      {showNewActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nouvelle action</h3>
              <button type="button" onClick={() => setShowNewActionModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitNewAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Vérifier stock Dépôt Nord"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Détails optionnels"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="stock">Stock</option>
                    <option value="retard">Livraison / Retard</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={form.severite}
                    onChange={(e) => setForm((f) => ({ ...f, severite: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="info">Basse</option>
                    <option value="attention">Moyenne</option>
                    <option value="urgent">Haute</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewActionModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">
                  Créer l'action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Actions;
