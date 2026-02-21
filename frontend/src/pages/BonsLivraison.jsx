import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Modal from '../components/common/Modal';
import CreateBLForm from '../components/bl/CreateBLForm';
import BLCard from '../components/bl/BLCard';
import { Plus, FileText, Clock, Check, X, Filter } from 'lucide-react';

const BonsLivraison = () => {
  const { bonsLivraison, commandes, addBonLivraison, updateBonLivraisonStatus, camions, stocks } = useApp();

  // Liste des camions pour le formulaire BL (immatriculation, chauffeur, compagnie)
  const camionsForBL = (camions || []).map((c) => ({
    id: c.id,
    immatriculation: c.immatriculation || c.id,
    chauffeur: c.chauffeur || '—',
    compagnie: (c.transporteur && c.transporteur.nom) ? c.transporteur.nom : '—',
  }));
  const { currentUser } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tous');
  const [selectedCommande, setSelectedCommande] = useState(null);

  const currentUserRole = currentUser?.role || 'dispatcher';

  // Calculer les counts dynamiquement
  const tabs = [
    { id: 'tous', label: 'Tous', count: bonsLivraison.length },
    { id: 'en-attente', label: 'En attente validation', count: bonsLivraison.filter(b => b.statut === 'en-attente').length },
    { id: 'en-transit', label: 'En Transit', count: bonsLivraison.filter(b => b.statut === 'en-transit').length },
    { id: 'livré', label: 'Livrés', count: bonsLivraison.filter(b => b.statut === 'livré').length },
  ];

  // Commandes validées (prêtes pour créer un BL)
  const commandesValidees = commandes.filter(cmd => cmd.statut === 'validee').map(cmd => ({
    id: cmd.id,
    client: cmd.client,
    produit: cmd.type,
    quantite: `${cmd.quantite.toLocaleString()} L`,
    quantiteRaw: cmd.quantite,
    typeCommande: cmd.typeCommande,
    referenceCommandeExterne: cmd.referenceCommandeExterne,
  }));

  // Formater les bons de livraison du Context
  const bonsFormatted = bonsLivraison.map(bon => ({
    id: bon.id,
    numeroBL: bon.id,
    numeroCommande: bon.numeroCommande,
    referenceCommandeExterne: '',
    client: bon.client,
    produit: bon.typeCarburant,
    volume: `${bon.quantiteCommandee?.toLocaleString() || 0} L`,
    transporteur: bon.chauffeur,
    immatriculation: bon.vehicule,
    depot: 'Dépôt Nord',
    dateChargement: `${bon.dateEmission} ${bon.heureDepart || ''}`,
    statut: bon.statut,
    creePar: currentUser ? `${currentUser.name || currentUser.email || 'Utilisateur'} (${currentUserRole})` : 'Système',
    dateCreation: bon.dateEmission,
    observations: bon.observations,
  }));


  const filteredBL = bonsFormatted.filter((bl) => {
    if (activeTab === 'tous') return true;
    return bl.statut === activeTab;
  });

  const handleCreateBL = async (blData) => {
    try {
      await addBonLivraison({
        numeroCommande: blData.numeroCommande,
        client: blData.client,
        chauffeur: blData.chauffeur,
        vehicule: blData.immatriculation,
        typeCarburant: blData.produit || selectedCommande?.produit,
        quantiteCommandee: parseInt(blData.volumeACharger || blData.quantite, 10),
        quantiteLivree: null,
        heureDepart: blData.heureDepart,
        heureArrivee: null,
        statut: 'en-attente',
        signature: false,
        observations: blData.observations || '',
      });
      setIsCreateModalOpen(false);
      setSelectedCommande(null);
    } catch (_) {}
  };

  const handleValidateBL = async (blId) => {
    try {
      await updateBonLivraisonStatus(blId, 'en-transit');
    } catch (_) {}
  };

  const handleRejectBL = async (blId) => {
    const motif = prompt('Motif du rejet:');
    if (motif) {
      try {
        await updateBonLivraisonStatus(blId, 'rejete');
      } catch (_) {}
    }
  };

  const handleViewBL = (bl) => {
    const details = `
 BON DE LIVRAISON: ${bl.numeroBL}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Client: ${bl.client}
 Produit: ${bl.produit}
 Volume: ${bl.volume}
 Transporteur: ${bl.transporteur}
 Véhicule: ${bl.immatriculation}
 Dépôt: ${bl.depot}
 Date: ${bl.dateChargement}
 Statut: ${bl.statut.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Créé par: ${bl.creePar}
 Le: ${bl.dateCreation}
${bl.validePar ? `\n Validé par: ${bl.validePar}\n Le: ${bl.dateValidation}` : ''}
    `.trim();
    
    toast.info(details, {
      autoClose: 8000,
      style: { whiteSpace: 'pre-line' },
    });
    
    // Simuler le téléchargement PDF après 1 seconde
    setTimeout(() => {
      toast.success(`BL ${bl.numeroBL} téléchargé en PDF.`);
    }, 1000);
  };

  const handleSelectCommande = (commande) => {
    setSelectedCommande(commande);
    setIsCreateModalOpen(true);
  };

  const stats = {
    total: bonsLivraison.length,
    enAttente: bonsLivraison.filter((bl) => bl.statut === 'en-attente-validation').length,
    valides: bonsLivraison.filter((bl) => bl.statut === 'valide').length,
    rejetes: bonsLivraison.filter((bl) => bl.statut === 'rejete').length,
  };

  return (
    <MainLayout title="Bons de Livraison" subtitle="Gestion et validation des BL">
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total BL</span>
              <div className="p-2 bg-gray-100 rounded">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En attente</span>
              <div className="p-2 bg-orange-100 rounded">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Validés</span>
              <div className="p-2 bg-green-100 rounded">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.valides}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Rejetés</span>
              <div className="p-2 bg-red-100 rounded">
                <X className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.rejetes}</div>
          </div>
        </div>

        {/* Commandes Validées (Section pour créer des BL) */}
        {currentUserRole === 'dispatcher' && commandesValidees.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Commandes Validées - Prêtes pour BL
                </h3>
                <p className="text-sm text-gray-600">
                  Ces commandes ont été validées par la Trésorerie et la Facturation (prêtes pour la logistique)
                </p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                {commandesValidees.length} commandes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {commandesValidees.map((commande) => (
                <div
                  key={commande.id}
                  className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-500">{commande.id}</span>
                    {commande.typeCommande === 'interne' && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        INTERNE
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{commande.client}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {commande.produit} • {commande.quantite}
                  </p>
                  {commande.referenceCommandeExterne && (
                    <p className="text-xs text-gray-500 mb-3">
                      Réf. Externe: {commande.referenceCommandeExterne}
                    </p>
                  )}
                  <button
                    onClick={() => handleSelectCommande(commande)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Créer BL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BL Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header with Tabs */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-gray-900">Liste des Bons de Livraison</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* BL Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBL.map((bl) => (
                <BLCard
                  key={bl.id}
                  bl={bl}
                  currentUserRole={currentUserRole}
                  onValidate={handleValidateBL}
                  onReject={handleRejectBL}
                  onView={handleViewBL}
                />
              ))}
            </div>

            {filteredBL.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun bon de livraison dans cette catégorie</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Create BL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCommande(null);
        }}
        title="Créer un Bon de Livraison"
        size="lg"
      >
        <CreateBLForm
          commande={selectedCommande}
          camions={camionsForBL}
          depots={stocks?.depots || []}
          onSubmit={handleCreateBL}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedCommande(null);
          }}
        />
      </Modal>
    </MainLayout>
  );
};

export default BonsLivraison;
