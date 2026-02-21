import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Modal from '../components/common/Modal';
import NewCommandeForm from '../components/commandes/NewCommandeForm';
import CommandeDetailsModal from '../components/commandes/CommandeDetailsModal';
import DropdownMenu from '../components/common/DropdownMenu';
import { exportCommandesToPDF, exportCommandesToExcel } from '../utils/exportUtils';
import { Plus, Search, Calendar, RotateCcw, MoreVertical, Eye, Edit, Trash2, FileText, CheckCircle, Download } from 'lucide-react';

const Commandes = () => {
  const [searchParams] = useSearchParams();
  const { commandes, addCommande, updateCommandeStatus, addBonLivraison } = useApp();
  const { hasPermission } = useAuth();
  const canCreateCommande = hasPermission('creer-commandes');
  const canModifyCommande = hasPermission('modifier-commandes');
  const canCreateBL = hasPermission('dispatcher') || hasPermission('creer-bl');
  const [selectedCommandes, setSelectedCommandes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommandeForDetails, setSelectedCommandeForDetails] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    statut: 'tous',
    type: 'tous',
    priorite: 'toutes',
    date: '',
  });

  useEffect(() => {
    const q = searchParams.get('search');
    if (q != null && q !== filters.search) {
      setFilters((f) => ({ ...f, search: q || '' }));
    }
  }, [searchParams]);

  const clientsList = [...new Set(commandes.map((c) => c.client).filter(Boolean))];

  // Convertir les données du Context au format de la page
  const commandesFormatted = commandes.map(cmd => ({
    id: cmd.id,
    client: cmd.client,
    type: cmd.type.toUpperCase(),
    typeColor: cmd.type.toLowerCase().includes('diesel') ? 'bg-blue-100 text-blue-700' : 
                cmd.type.toLowerCase().includes('essence') ? 'bg-green-100 text-green-700' : 
                'bg-purple-100 text-purple-700',
    quantity: `${cmd.quantite.toLocaleString()} L`,
    quantite: cmd.quantite,
    date: cmd.date,
    statut: cmd.statut === 'en_attente_tresorerie' ? 'Trésorerie' : cmd.statut === 'valide_tresorerie' ? 'Validé Trés.' : cmd.statut === 'en_attente_facturation' ? 'Facturation' : cmd.statut?.toUpperCase?.() || cmd.statut,
    statutColor: cmd.statut === 'en_attente_tresorerie' ? 'bg-amber-100 text-amber-700' :
                  cmd.statut === 'valide_tresorerie' ? 'bg-blue-100 text-blue-700' :
                  cmd.statut === 'en_attente_facturation' ? 'bg-indigo-100 text-indigo-700' :
                  cmd.statut === 'validee' ? 'bg-green-100 text-green-700' :
                  cmd.statut === 'en-transit' ? 'bg-orange-100 text-orange-700' :
                  cmd.statut === 'livree' ? 'bg-gray-900 text-white' :
                  cmd.statut === 'annulee' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700',
    priorite: cmd.priorite,
    typeCommande: cmd.typeCommande,
    referenceCommandeExterne: cmd.referenceCommandeExterne,
  }));


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCommandes(filteredCommandes.map(cmd => cmd.id));
    } else {
      setSelectedCommandes([]);
    }
  };

  const handleSelectCommande = (id) => {
    if (selectedCommandes.includes(id)) {
      setSelectedCommandes(selectedCommandes.filter(cmdId => cmdId !== id));
    } else {
      setSelectedCommandes([...selectedCommandes, id]);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      statut: 'tous',
      type: 'tous',
      priorite: 'toutes',
      date: '',
    });
  };

  const typeCarburantToLabel = {
    diesel: 'Diesel B7',
    essence: 'Essence E10',
    'jet-a1': 'Jet A-1 (Aviation)',
    kerosene: 'Kérosène',
    'fuel-maritime': 'Fuel Maritime',
  };

  const handleSaveCommande = async (formData) => {
    try {
      const client = formData.newClient ? formData.clientName : formData.client;
      const type = typeCarburantToLabel[formData.typeCarburant] || formData.typeCarburant || 'Diesel B7';
      const quantite = parseInt(formData.quantity, 10) || 0;
      await addCommande({
        client,
        type,
        quantite,
        priorite: formData.priorite || 'normale',
        typeCommande: formData.typeCommande || 'externe',
        referenceCommandeExterne: formData.referenceCommandeExterne || null,
        destination: formData.addresseLivraison?.trim() || null,
      });
      setIsModalOpen(false);
    } catch (_) {
      // toast géré dans addCommande
    }
  };

  // Logique de filtrage dynamique
  const filteredCommandes = commandesFormatted.filter((commande) => {
    // Filtre par recherche (client ou ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        commande.client.toLowerCase().includes(searchLower) ||
        commande.id.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtre par statut
    if (filters.statut !== 'tous') {
      if (commande.statut.toLowerCase() !== filters.statut) return false;
    }

    // Filtre par type
    if (filters.type !== 'tous') {
      if (!commande.type.toLowerCase().includes(filters.type)) return false;
    }

    return true;
  });

  const getActionMenuItems = (commande) => {
    const items = [
      {
        label: 'Voir détails',
        icon: Eye,
        onClick: () => setSelectedCommandeForDetails(commande),
      },
    ];
    if (canModifyCommande) {
      items.push({
        label: 'Modifier',
        icon: Edit,
        onClick: () => {
          toast.info(`Modification de la commande ${commande.id} (fonctionnalité à implémenter avec modal)`, { autoClose: 3000 });
        },
      });
    }
    if (canCreateBL) {
      items.push({
        label: 'Générer bon de livraison',
        icon: FileText,
        onClick: () => {
          const originalCmd = commandes.find(c => c.id === commande.id);
          if (originalCmd && originalCmd.statut === 'validee') {
            addBonLivraison({
              numeroCommande: commande.id,
              client: commande.client,
              chauffeur: 'À assigner',
              vehicule: 'À assigner',
              typeCarburant: commande.type,
              quantiteCommandee: commande.quantite,
              quantiteLivree: null,
              heureDepart: null,
              heureArrivee: null,
              statut: 'en-attente',
              signature: false,
              observations: `Généré depuis commande ${commande.id}`,
            });
            toast.success(`Bon de livraison créé pour la commande ${commande.id}`);
          } else {
            toast.warning('La commande doit être validée avant de générer un BL.');
          }
        },
      });
    }
    if (canModifyCommande) {
      items.push({
        label: 'Annuler commande',
        icon: Trash2,
        danger: true,
        onClick: () => {
          if (window.confirm(`Êtes-vous sûr de vouloir annuler la commande ${commande.id} ?`)) {
            updateCommandeStatus(commande.id, 'annulee');
            toast.error(`Commande ${commande.id} annulée.`);
          }
        },
      });
    }
    return items;
  };

  return (
    <MainLayout title="Commandes" subtitle="Gestion de l'approvisionnement client">
      <div className="p-8">
        {/* Header with New Command Button */}
        <div className="mb-6 flex justify-end">
          <div className="flex gap-3">
            <button
              onClick={() => {
                exportCommandesToPDF(commandesFormatted);
                toast.success('Export PDF téléchargé.');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
            >
              <FileText className="w-5 h-5" />
              PDF
            </button>
            <button
              onClick={() => {
                exportCommandesToExcel(commandesFormatted);
                toast.success('Export Excel téléchargé.');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
            >
              <Download className="w-5 h-5" />
              Excel
            </button>
            {canCreateCommande && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                NOUVELLE COMMANDE
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Statut Filter */}
            <div>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="tous">Statut: Tous</option>
                <option value="en_attente_tresorerie">En attente Trésorerie</option>
                <option value="valide_tresorerie">Validé Trésorerie</option>
                <option value="en_attente_facturation">En attente Facturation</option>
                <option value="validee">Validée (Logistique)</option>
                <option value="en-transit">En transit</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="tous">Type: Tous</option>
                <option value="diesel">Diesel</option>
                <option value="essence">Essence</option>
                <option value="jet-a1">Jet A-1</option>
                <option value="kerosene">Kérosène</option>
              </select>
            </div>

            {/* Priorité Filter */}
            <div>
              <select
                value={filters.priorite}
                onChange={(e) => setFilters({ ...filters, priorite: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none bg-white cursor-pointer"
              >
                <option value="toutes">Priorité: Toutes</option>
                <option value="critique">Critique</option>
                <option value="urgent">Urgent</option>
                <option value="normale">Normale</option>
              </select>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                placeholder="jj/mm/aaaa"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredCommandes.length > 0 && selectedCommandes.length === filteredCommandes.length}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COMMANDE ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CLIENT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE CARBURANT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITÉ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE PRÉVUE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCommandes.map((commande) => (
                  <tr key={commande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCommandes.includes(commande.id)}
                        onChange={() => handleSelectCommande(commande.id)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-500">{commande.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{commande.client}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${commande.typeColor}`}>
                        {commande.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{commande.quantity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{commande.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${commande.statutColor}`}>
                        {commande.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DropdownMenu items={getActionMenuItems(commande)}>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Affichage de {filteredCommandes.length} sur {commandesFormatted.length} commandes
              {filters.search && <span className="ml-2 text-orange-600 font-medium">(filtrées)</span>}
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                PRÉC
              </button>
              <button className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg">
                1
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                2
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                3
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                SUIV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for New Commande */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle Commande"
        size="lg"
      >
        <NewCommandeForm
          clients={clientsList}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCommande}
        />
      </Modal>

      {/* Modal for Commande Details */}
      {selectedCommandeForDetails && (
        <CommandeDetailsModal
          commande={selectedCommandeForDetails}
          onClose={() => setSelectedCommandeForDetails(null)}
        />
      )}
    </MainLayout>
  );
};

export default Commandes;
