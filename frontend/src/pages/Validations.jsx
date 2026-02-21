import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import { CheckCircle, XCircle, Clock, User, Package, FileText, AlertCircle, Banknote, Receipt } from 'lucide-react';

const Validations = () => {
  const { currentUser, hasPermission } = useAuth();
  const { commandes, validationTresorerie, validationFacturation, bonsLivraison, updateBonLivraisonStatus } = useApp();
  const [activeTab, setActiveTab] = useState('tresorerie');
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Trésorerie: commandes en attente de validation paiement
  const commandesTresorerie = commandes.filter((c) => c.statut === 'en_attente_tresorerie');
  // Facturation: commandes validées par trésorerie, en attente numéro BC interne
  const commandesFacturation = commandes.filter((c) => c.statut === 'valide_tresorerie');
  // BL en attente (manager logistique)
  const pendingBL = hasPermission('valider-bl')
    ? bonsLivraison.filter((bl) => bl.statut === 'en-attente')
    : [];

  const [formTresorerie, setFormTresorerie] = useState({
    commandeId: null,
    paiementRecu: true,
    moyenPaiement: 'virement',
    numeroCheque: '',
    numeroTransactionVirement: '',
  });
  const [formFacturation, setFormFacturation] = useState({ commandeId: null, numeroBonCommandeInterne: '' });

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente_tresorerie: { color: 'bg-amber-100 text-amber-700', label: 'En attente Trésorerie' },
      valide_tresorerie: { color: 'bg-blue-100 text-blue-700', label: 'Validé Trésorerie' },
      en_attente_facturation: { color: 'bg-indigo-100 text-indigo-700', label: 'En attente Facturation' },
      validee: { color: 'bg-green-100 text-green-700', label: 'Validée (Logistique)' },
      nouvelle: { color: 'bg-blue-100 text-blue-700', label: 'Nouvelle' },
      annulee: { color: 'bg-red-100 text-red-700', label: 'Annulée' },
      'en-attente': { color: 'bg-yellow-100 text-yellow-700', label: 'En Attente' },
      'en-transit': { color: 'bg-blue-100 text-blue-700', label: 'En Transit' },
      livre: { color: 'bg-green-100 text-green-700', label: 'Livré' },
      livré: { color: 'bg-green-100 text-green-700', label: 'Livré' },
    };
    const badge = badges[statut] || { color: 'bg-gray-100 text-gray-700', label: statut };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleSubmitTresorerie = async (e) => {
    e.preventDefault();
    if (!formTresorerie.commandeId) return;
    if (!formTresorerie.paiementRecu) {
      toast.warning('Veuillez confirmer que le paiement a été reçu.');
      return;
    }
    try {
      await validationTresorerie(formTresorerie.commandeId, {
        paiementRecu: formTresorerie.paiementRecu,
        moyenPaiement: formTresorerie.moyenPaiement,
        numeroCheque: formTresorerie.moyenPaiement === 'cheque' ? formTresorerie.numeroCheque : undefined,
        numeroTransactionVirement: formTresorerie.moyenPaiement === 'virement' ? formTresorerie.numeroTransactionVirement : undefined,
      });
      setFormTresorerie({ commandeId: null, paiementRecu: true, moyenPaiement: 'virement', numeroCheque: '', numeroTransactionVirement: '' });
    } catch (_) {}
  };

  const handleSubmitFacturation = async (e) => {
    e.preventDefault();
    if (!formFacturation.commandeId) return;
    const num = String(formFacturation.numeroBonCommandeInterne || '').trim();
    if (!num) {
      toast.warning('Veuillez saisir ou coller le numéro de bon de commande interne.');
      return;
    }
    try {
      await validationFacturation(formFacturation.commandeId, num);
      setFormFacturation({ commandeId: null, numeroBonCommandeInterne: '' });
    } catch (_) {}
  };

  const handleValidateBL = async (blId) => {
    if (!hasPermission('valider-bl')) return;
    try {
      await updateBonLivraisonStatus(blId, 'en-transit');
      toast.success('Bon de livraison validé.');
      setSelectedItem(null);
    } catch (_) {}
  };

  const handleRejectBL = async (blId) => {
    if (!rejectionReason.trim()) {
      toast.error('Veuillez indiquer le motif du rejet.');
      return;
    }
    try {
      await updateBonLivraisonStatus(blId, 'rejete');
      toast.warning('BL rejeté.');
      setSelectedItem(null);
      setRejectionReason('');
    } catch (_) {}
  };

  const tabs = [
    { id: 'tresorerie', label: 'Trésorerie', icon: Banknote, count: commandesTresorerie.length, permission: 'valider-tresorerie' },
    { id: 'facturation', label: 'Facturation', icon: Receipt, count: commandesFacturation.length, permission: 'valider-facturation' },
    { id: 'bons-livraison', label: 'Bons de Livraison', icon: FileText, count: pendingBL.length, permission: 'valider-bl' },
  ];
  const visibleTabs = tabs.filter((tab) => !tab.permission || hasPermission(tab.permission));

  if (visibleTabs.length === 0) {
    return (
      <MainLayout title="Validations" subtitle="Trésorerie, Facturation, Bons de livraison">
        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Accès limité</h3>
            <p className="text-gray-600">Vous n'avez pas les permissions pour ce module.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const defaultTab = visibleTabs[0]?.id || 'tresorerie';
  const currentTab = visibleTabs.some((t) => t.id === activeTab) ? activeTab : defaultTab;

  return (
    <MainLayout title="Validations" subtitle="Trésorerie → Facturation → Logistique">
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En attente Trésorerie</span>
              <Banknote className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{commandesTresorerie.length}</div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En attente Facturation</span>
              <Receipt className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{commandesFacturation.length}</div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">BL à valider</span>
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{pendingBL.length}</div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Rôle</span>
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-sm font-semibold text-orange-600 capitalize">{currentUser?.role?.replace(/-/g, ' ')}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium ${
                  currentTab === tab.id ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Trésorerie */}
        {currentTab === 'tresorerie' && (
          <div className="space-y-4">
            {commandesTresorerie.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande en attente</h3>
                <p className="text-gray-600">Les commandes validées par le commercial arrivent ici. Vérifiez le paiement puis validez.</p>
              </div>
            ) : (
              commandesTresorerie.map((commande) => (
                <div key={commande.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{commande.id}</h4>
                        {getStatusBadge(commande.statut)}
                      </div>
                      <p className="text-sm text-gray-600"><strong>Client:</strong> {commande.client}</p>
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {commande.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{Number(commande.quantite).toLocaleString('fr-FR')} L</div>
                      <p className="text-sm text-gray-600">{commande.type}</p>
                    </div>
                  </div>

                  {formTresorerie.commandeId === commande.id ? (
                    <form onSubmit={handleSubmitTresorerie} className="border-t border-gray-100 pt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="paiementRecu"
                          checked={formTresorerie.paiementRecu}
                          onChange={(e) => setFormTresorerie((f) => ({ ...f, paiementRecu: e.target.checked }))}
                        />
                        <label htmlFor="paiementRecu">Le paiement a été reçu</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
                        <select
                          value={formTresorerie.moyenPaiement}
                          onChange={(e) => setFormTresorerie((f) => ({ ...f, moyenPaiement: e.target.value }))}
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="virement">Virement</option>
                          <option value="cheque">Chèque</option>
                          <option value="especes">Espèces</option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                      {formTresorerie.moyenPaiement === 'cheque' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de chèque</label>
                          <input
                            type="text"
                            value={formTresorerie.numeroCheque}
                            onChange={(e) => setFormTresorerie((f) => ({ ...f, numeroCheque: e.target.value }))}
                            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Ex: CHQ-123456"
                          />
                        </div>
                      )}
                      {formTresorerie.moyenPaiement === 'virement' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de transaction / Référence virement</label>
                          <input
                            type="text"
                            value={formTresorerie.numeroTransactionVirement}
                            onChange={(e) => setFormTresorerie((f) => ({ ...f, numeroTransactionVirement: e.target.value }))}
                            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Ex: TRX-789012"
                          />
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Valider et envoyer à la Facturation
                        </button>
                        <button type="button" onClick={() => setFormTresorerie({ commandeId: null, paiementRecu: true, moyenPaiement: 'virement', numeroCheque: '', numeroTransactionVirement: '' })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setFormTresorerie((f) => ({ ...f, commandeId: commande.id }))}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium flex items-center gap-2"
                      >
                        <Banknote className="w-5 h-5" /> Vérifier paiement et valider
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Facturation */}
        {currentTab === 'facturation' && (
          <div className="space-y-4">
            {commandesFacturation.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune commande en attente</h3>
                <p className="text-gray-600">Après validation Trésorerie, les commandes arrivent ici. Saisissez le numéro de BC interne puis validez.</p>
              </div>
            ) : (
              commandesFacturation.map((commande) => (
                <div key={commande.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{commande.id}</h4>
                        {getStatusBadge(commande.statut)}
                      </div>
                      <p className="text-sm text-gray-600"><strong>Client:</strong> {commande.client}</p>
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {commande.date}</p>
                      {commande.moyenPaiement && (
                        <p className="text-xs text-gray-500 mt-1">Paiement: {commande.moyenPaiement} {commande.numeroTransactionVirement && `- ${commande.numeroTransactionVirement}`} {commande.numeroCheque && `- ${commande.numeroCheque}`}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{Number(commande.quantite).toLocaleString('fr-FR')} L</div>
                      <p className="text-sm text-gray-600">{commande.type}</p>
                    </div>
                  </div>

                  {formFacturation.commandeId === commande.id ? (
                    <form onSubmit={handleSubmitFacturation} className="border-t border-gray-100 pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de bon de commande interne</label>
                        <p className="text-xs text-gray-500 mb-2">Créez le BC dans votre système, puis copiez-collez le numéro ici.</p>
                        <textarea
                          value={formFacturation.numeroBonCommandeInterne}
                          onChange={(e) => setFormFacturation((f) => ({ ...f, numeroBonCommandeInterne: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows={2}
                          placeholder="Ex: BC-INT-2024-001 ou coller les infos du BC"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Valider et envoyer à la Logistique
                        </button>
                        <button type="button" onClick={() => setFormFacturation({ commandeId: null, numeroBonCommandeInterne: '' })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setFormFacturation((f) => ({ ...f, commandeId: commande.id }))}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium flex items-center gap-2"
                      >
                        <Receipt className="w-5 h-5" /> Saisir n° BC interne et valider
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Bons de Livraison */}
        {currentTab === 'bons-livraison' && (
          <div>
            {pendingBL.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun BL en attente</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBL.map((bl) => (
                  <div key={bl.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{bl.numeroBL || bl.id}</h4>
                          {getStatusBadge(bl.statut)}
                        </div>
                        <p className="text-sm text-gray-600"><strong>Commande:</strong> {bl.numeroCommande}</p>
                        <p className="text-sm text-gray-600"><strong>Client:</strong> {bl.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{Number(bl.quantiteCommandee || 0).toLocaleString('fr-FR')} L</div>
                        <p className="text-sm text-gray-600">{bl.typeCarburant}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button onClick={() => handleValidateBL(bl.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                        <CheckCircle className="w-5 h-5" /> Valider & Expédier
                      </button>
                      <button onClick={() => setSelectedItem({ type: 'bl', data: bl })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                        <XCircle className="w-5 h-5" /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal rejet BL */}
        {selectedItem?.type === 'bl' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Motif du rejet</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez la raison du rejet..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => { setSelectedItem(null); setRejectionReason(''); }} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                  Annuler
                </button>
                <button onClick={() => handleRejectBL(selectedItem.data.id)} className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Validations;
