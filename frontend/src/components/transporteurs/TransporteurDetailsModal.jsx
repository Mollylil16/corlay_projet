import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Building2, Phone, User, Mail, MapPin, Truck, Plus, Package, Trash2, Pencil } from 'lucide-react';
import { getCouleurTransporteur, COULEURS_TRANSPORTEUR } from '../../constants/couleursTransporteur';
import { COULEURS_CAMION } from '../../constants/couleursCamion';

const statusLabels = { disponible: 'Disponible', 'en-mission': 'En mission', maintenance: 'Maintenance' };

/** Sélecteur de couleur type Canva : pastilles + couleur personnalisée */
function ColorPickerCamion({ value, onChange, size = 'normal' }) {
  const isCompact = size === 'compact';
  const swatchSize = isCompact ? 'w-7 h-7' : 'w-9 h-9';
  const customHex = value && value.startsWith('#') ? value : '';
  const selectedLabel = value && !value.startsWith('#') ? value : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {COULEURS_CAMION.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.label)}
          className={`${swatchSize} rounded-lg border-2 transition-all shrink-0 ${
            selectedLabel === c.label ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-400 scale-110' : 'border-gray-200 hover:border-gray-400'
          }`}
          style={{ backgroundColor: c.hex }}
          title={c.label}
        />
      ))}
      <div className="flex items-center gap-1">
        <span className={isCompact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>Autre</span>
        <input
          type="color"
          value={customHex || '#888888'}
          onChange={(e) => onChange(e.target.value)}
          className={`${swatchSize} rounded-lg cursor-pointer border-2 border-gray-200 p-0.5 bg-transparent shrink-0`}
          title="Couleur personnalisée"
        />
      </div>
    </div>
  );
}

const TransporteurDetailsModal = ({
  transporteur,
  isOpen,
  onClose,
  onCreateCamion,
  onUpdateTransporteur,
  onUpdateCamion,
  onDeleteTransporteur,
  onDeleteCamion,
  canAddCamion = true,
  canManage = false,
}) => {
  const [showAddCamion, setShowAddCamion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [editCompanyForm, setEditCompanyForm] = useState({ nom: '', telephone: '', nomContact: '', adresse: '', email: '', couleur: 'orange' });
  const [editingCamionId, setEditingCamionId] = useState(null);
  const [savingCamion, setSavingCamion] = useState(false);
  const [editCamionForm, setEditCamionForm] = useState({ marque: '', couleur: '', chauffeur: '', telephoneChauffeur: '', statut: 'disponible' });
  const [form, setForm] = useState({
    immatriculation: '',
    marque: '',
    couleur: '',
    chauffeur: '',
    telephoneChauffeur: '',
    statut: 'disponible',
    compartiments: [{ capaciteLitres: '' }],
  });

  useEffect(() => {
    if (transporteur) {
      setEditCompanyForm({
        nom: transporteur.nom || '',
        telephone: transporteur.telephone || '',
        nomContact: transporteur.nomContact || '',
        adresse: transporteur.adresse || '',
        email: transporteur.email || '',
        couleur: transporteur.couleur || 'orange',
      });
    }
  }, [transporteur?.id]);

  if (!transporteur) return null;

  const camions = transporteur.camions || [];
  const couleur = getCouleurTransporteur(transporteur.couleur);

  const handleStartEditCompany = () => setEditingCompany(true);
  const handleCancelEditCompany = () => setEditingCompany(false);
  const handleSubmitCompany = async (e) => {
    e.preventDefault();
    if (!editCompanyForm.nom?.trim() || !editCompanyForm.telephone?.trim()) return;
    setSavingCompany(true);
    try {
      await onUpdateTransporteur?.(transporteur.id, editCompanyForm);
      setEditingCompany(false);
    } catch (_) {}
    setSavingCompany(false);
  };

  const handleStartEditCamion = (c) => {
    setEditingCamionId(c.id);
    setEditCamionForm({
      marque: c.marque || '',
      couleur: c.couleur || '',
      chauffeur: c.chauffeur || '',
      telephoneChauffeur: c.telephoneChauffeur || '',
      statut: c.statut || 'disponible',
    });
  };
  const handleCancelEditCamion = () => {
    setEditingCamionId(null);
  };
  const handleSubmitCamionEdit = async (e, camionId) => {
    e.preventDefault();
    setSavingCamion(true);
    try {
      await onUpdateCamion?.(camionId, {
        marque: editCamionForm.marque.trim() || undefined,
        couleur: editCamionForm.couleur.trim() || undefined,
        chauffeur: editCamionForm.chauffeur.trim() || undefined,
        telephoneChauffeur: editCamionForm.telephoneChauffeur.trim() || undefined,
        statut: editCamionForm.statut,
      });
      setEditingCamionId(null);
    } catch (_) {}
    setSavingCamion(false);
  };

  const handleDeleteCompagnie = async () => {
    if (!window.confirm(`Supprimer la compagnie "${transporteur.nom}" et tous ses camions ? Cette action est irréversible.`)) return;
    try {
      await onDeleteTransporteur?.(transporteur.id);
      onClose();
    } catch (_) {}
  };

  const handleDeleteCamion = async (camion) => {
    if (!window.confirm(`Supprimer le camion ${camion.immatriculation} ? Impossible si des tournées y sont associées.`)) return;
    try {
      await onDeleteCamion?.(camion.id);
    } catch (_) {}
  };

  const handleAddCompartiment = () => {
    setForm((f) => ({ ...f, compartiments: [...f.compartiments, { capaciteLitres: '' }] }));
  };
  const handleRemoveCompartiment = (index) => {
    if (form.compartiments.length <= 1) return;
    setForm((f) => ({ ...f, compartiments: f.compartiments.filter((_, i) => i !== index) }));
  };
  const handleCompartimentChange = (index, value) => {
    setForm((f) => ({
      ...f,
      compartiments: f.compartiments.map((c, i) => (i === index ? { capaciteLitres: value } : c)),
    }));
  };

  const handleSubmitCamion = async (e) => {
    e.preventDefault();
    const capacites = form.compartiments.map((c) => Number(c.capaciteLitres) || 0).filter((n) => n > 0);
    if (!form.immatriculation.trim()) return;
    if (capacites.length === 0) {
      return;
    }
    setSaving(true);
    try {
      await onCreateCamion({
        transporteurId: transporteur.id,
        immatriculation: form.immatriculation.trim(),
        marque: form.marque.trim() || undefined,
        couleur: form.couleur.trim() || undefined,
        chauffeur: form.chauffeur.trim() || undefined,
        telephoneChauffeur: form.telephoneChauffeur.trim() || undefined,
        statut: form.statut,
        compartiments: capacites.map((cap, i) => ({ ordre: i + 1, capaciteLitres: cap })),
      });
      setForm({ immatriculation: '', marque: '', couleur: '', chauffeur: '', telephoneChauffeur: '', statut: 'disponible', compartiments: [{ capaciteLitres: '' }] });
      setShowAddCamion(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Profil : ${transporteur.nom}`} size="xl">
      <div className="space-y-6">
        {/* Infos compagnie */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          {editingCompany ? (
            <form onSubmit={handleSubmitCompany} className="space-y-4">
              <h5 className="font-medium text-gray-900">Modifier la compagnie</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom (raison sociale) *</label>
                  <input type="text" required value={editCompanyForm.nom} onChange={(e) => setEditCompanyForm((f) => ({ ...f, nom: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input type="text" required value={editCompanyForm.telephone} onChange={(e) => setEditCompanyForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input type="text" value={editCompanyForm.nomContact} onChange={(e) => setEditCompanyForm((f) => ({ ...f, nomContact: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editCompanyForm.email} onChange={(e) => setEditCompanyForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" value={editCompanyForm.adresse} onChange={(e) => setEditCompanyForm((f) => ({ ...f, adresse: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de la carte</label>
                  <div className="flex flex-wrap gap-2">
                    {COULEURS_TRANSPORTEUR.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditCompanyForm((f) => ({ ...f, couleur: c.id }))}
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.bg} border-2 transition-all ${editCompanyForm.couleur === c.id ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-400' : 'border-transparent'}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleCancelEditCompany} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={savingCompany} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">{savingCompany ? 'Enregistrement…' : 'Enregistrer'}</button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-gradient-to-br ${couleur.bg} rounded-lg`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{transporteur.telephone}</span>
                  </div>
                  {transporteur.nomContact && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Contact : {transporteur.nomContact}</span>
                    </div>
                  )}
                  {transporteur.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{transporteur.email}</span>
                    </div>
                  )}
                  {transporteur.adresse && (
                    <div className="flex items-center gap-2 text-sm md:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{transporteur.adresse}</span>
                    </div>
                  )}
                </div>
                {canManage && onUpdateTransporteur && (
                  <button type="button" onClick={handleStartEditCompany} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Modifier la compagnie">
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Flotte */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              Flotte ({camions.length} camion{camions.length !== 1 ? 's' : ''})
            </h4>
            {canAddCamion && (
              <button
                type="button"
                onClick={() => setShowAddCamion((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 ${couleur.btn} text-white rounded-lg text-sm font-medium`}
              >
                <Plus className="w-4 h-4" />
                {showAddCamion ? 'Annuler' : 'Ajouter un camion'}
              </button>
            )}
          </div>

          {showAddCamion && (
            <form onSubmit={handleSubmitCamion} className="mb-6 p-4 border border-orange-200 rounded-xl bg-orange-50/50 space-y-4">
              <h5 className="font-medium text-gray-900">Nouveau camion</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de plaque *</label>
                  <input type="text" required value={form.immatriculation} onChange={(e) => setForm((f) => ({ ...f, immatriculation: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="ex: CI-3903-X" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                  <input type="text" value={form.marque} onChange={(e) => setForm((f) => ({ ...f, marque: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="ex: Mercedes-Benz, Volvo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                  <ColorPickerCamion value={form.couleur} onChange={(v) => setForm((f) => ({ ...f, couleur: v }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur (optionnel)</label>
                  <input type="text" value={form.chauffeur} onChange={(e) => setForm((f) => ({ ...f, chauffeur: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone chauffeur</label>
                  <input type="text" value={form.telephoneChauffeur} onChange={(e) => setForm((f) => ({ ...f, telephoneChauffeur: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Compartiments (capacité en L par cuve) *</label>
                  <button type="button" onClick={handleAddCompartiment} className="text-sm text-orange-600 hover:underline">+ Ajouter un compartiment</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {form.compartiments.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <input type="number" min={1} value={c.capaciteLitres} onChange={(e) => handleCompartimentChange(i, e.target.value)} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="L" />
                      <span className="text-sm text-gray-500">L</span>
                      {form.compartiments.length > 1 && (
                        <button type="button" onClick={() => handleRemoveCompartiment(i)} className="text-red-600 text-sm hover:underline">Suppr.</button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total : {form.compartiments.reduce((s, c) => s + (Number(c.capaciteLitres) || 0), 0).toLocaleString('fr-FR')} L</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddCamion(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">{saving ? 'Enregistrement…' : 'Enregistrer le camion'}</button>
              </div>
            </form>
          )}

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700">Plaque</th>
                  <th className="text-left p-3 font-medium text-gray-700">Marque</th>
                  <th className="text-left p-3 font-medium text-gray-700">Couleur</th>
                  <th className="text-left p-3 font-medium text-gray-700">Chauffeur</th>
                  <th className="text-right p-3 font-medium text-gray-700">Capacité</th>
                  <th className="text-left p-3 font-medium text-gray-700">Statut</th>
                  {canManage && <th className="text-right p-3 font-medium text-gray-700">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {camions.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="p-6 text-center text-gray-500">
                      {canAddCamion ? 'Aucun camion. Cliquez sur "Ajouter un camion" pour enregistrer le premier.' : 'Aucun camion enregistré.'}
                    </td>
                  </tr>
                ) : (
                  camions.map((c) => {
                    const totalL = (c.compartiments || []).reduce((s, comp) => s + (comp.capaciteLitres || 0), 0);
                    const isEditing = editingCamionId === c.id;
                    return (
                      <React.Fragment key={c.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{c.immatriculation}</td>
                          <td className="p-3 text-gray-600">{c.marque || '—'}</td>
                          <td className="p-3 text-gray-600">
                            {c.couleur ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 rounded border border-gray-300 shrink-0" style={c.couleur.startsWith('#') ? { backgroundColor: c.couleur } : { backgroundColor: COULEURS_CAMION.find((x) => x.label === c.couleur)?.hex || '#e5e7eb' }} />
                                {c.couleur.startsWith('#') ? 'Personnalisé' : c.couleur}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="p-3 text-gray-600">{c.chauffeur || '—'}</td>
                          <td className="p-3 text-right font-medium">{totalL.toLocaleString('fr-FR')} L</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              c.statut === 'disponible' ? 'bg-green-100 text-green-800' : c.statut === 'en-mission' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {statusLabels[c.statut] || c.statut}
                            </span>
                          </td>
                          {canManage && (
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCamion(c)}
                                  disabled={!!editingCamionId}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                  title="Modifier ce camion"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCamion(c)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer ce camion"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                        {isEditing && canManage && (
                          <tr className="bg-orange-50/50">
                            <td colSpan={canManage ? 7 : 6} className="p-4">
                              <form onSubmit={(e) => handleSubmitCamionEdit(e, c.id)} className="flex flex-wrap items-end gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marque</label>
                                  <input type="text" value={editCamionForm.marque} onChange={(e) => setEditCamionForm((f) => ({ ...f, marque: e.target.value }))} className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" placeholder="ex: DAF" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                                  <ColorPickerCamion value={editCamionForm.couleur} onChange={(v) => setEditCamionForm((f) => ({ ...f, couleur: v }))} size="compact" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Chauffeur</label>
                                  <input type="text" value={editCamionForm.chauffeur} onChange={(e) => setEditCamionForm((f) => ({ ...f, chauffeur: e.target.value }))} className="w-36 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tél. chauffeur</label>
                                  <input type="text" value={editCamionForm.telephoneChauffeur} onChange={(e) => setEditCamionForm((f) => ({ ...f, telephoneChauffeur: e.target.value }))} className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                                  <select value={editCamionForm.statut} onChange={(e) => setEditCamionForm((f) => ({ ...f, statut: e.target.value }))} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                                    {Object.entries(statusLabels).map(([k, v]) => (
                                      <option key={k} value={k}>{v}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button type="button" onClick={handleCancelEditCamion} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
                                  <button type="submit" disabled={savingCamion} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50">{savingCamion ? '…' : 'Enregistrer'}</button>
                                </div>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {canManage && onDeleteTransporteur && (
            <button
              type="button"
              onClick={handleDeleteCompagnie}
              className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
            >
              Supprimer la compagnie
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">Fermer</button>
        </div>
      </div>
    </Modal>
  );
};

export default TransporteurDetailsModal;
