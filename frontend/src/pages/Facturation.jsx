import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import { Download, Mail, FileText, Eye, Search, Filter, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const Facturation = () => {
  const { commandes, bonsLivraison } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selectedPeriod, setSelectedPeriod] = useState('mois-en-cours');

  // Générer les factures à partir des BL livrés (données API)
  const generateFactures = () => {
    const blLivres = bonsLivraison.filter((bl) => bl.statut === 'livré');
    return blLivres.map((bl) => {
      const commande = commandes.find((cmd) => cmd.id === bl.numeroCommande);
      const type = (bl.typeCarburant || '').toLowerCase();
      const prixUnitaire = type.includes('diesel') ? 650 : type.includes('essence') ? 750 : 700;
      const quantite = bl.quantiteLivree ?? bl.quantiteCommandee ?? 0;
      const montantHT = quantite * prixUnitaire;
      const tva = montantHT * 0.18;
      const montantTTC = montantHT + tva;
      return {
        id: `FAC-${(bl.id || '').replace(/\D/g, '').slice(-4) || '0000'}`,
        numeroBL: bl.id,
        client: bl.client || commande?.client || 'Client inconnu',
        date: bl.dateLivraison || bl.dateEmission,
        produit: bl.typeCarburant,
        quantite,
        prixUnitaire,
        montantHT,
        tva,
        montantTTC,
        statut: 'payee',
        commandeRef: bl.numeroCommande,
      };
    });
  };

  const factures = generateFactures();

  // Filtrer factures
  const filteredFactures = factures.filter(facture => {
    const matchesSearch = 
      facture.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facture.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facture.numeroBL.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'tous' || facture.statut === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: factures.length,
    montantTotal: factures.reduce((sum, f) => sum + f.montantTTC, 0),
    payees: factures.filter(f => f.statut === 'payee').length,
    enAttente: factures.filter(f => f.statut === 'en-attente').length,
  };

  const generateInvoicePDF = (facture) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(255, 122, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CorlayFlow - Distribution de Carburant', 20, 33);
    
    // Invoice Number
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(facture.id, 150, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 150, 33);
    
    // Company Info
    doc.setFontSize(10);
    doc.text('CORLAY SARL', 20, 55);
    doc.text('Zone Industrielle', 20, 61);
    doc.text('Abidjan, Côte d\'Ivoire', 20, 67);
    doc.text('Tél: +225 27 XX XX XX XX', 20, 73);
    doc.text('Email: contact@corlay.ci', 20, 79);
    
    // Client Info
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À:', 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.client, 120, 61);
    doc.text(`Réf. Commande: ${facture.commandeRef}`, 120, 67);
    doc.text(`Bon de Livraison: ${facture.numeroBL}`, 120, 73);
    
    // Table
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Quantité', 'Prix Unitaire', 'Montant HT']],
      body: [
        [
          facture.produit,
          `${facture.quantite.toLocaleString()} L`,
          `${facture.prixUnitaire.toLocaleString()} FCFA`,
          `${facture.montantHT.toLocaleString()} FCFA`,
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: [255, 122, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
      },
    });
    
    // Totals
    const finalY = doc.previousAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Montant HT:', 120, finalY);
    doc.text(`${facture.montantHT.toLocaleString()} FCFA`, 170, finalY, { align: 'right' });
    
    doc.text('TVA (18%):', 120, finalY + 7);
    doc.text(`${facture.tva.toLocaleString()} FCFA`, 170, finalY + 7, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Montant TTC:', 120, finalY + 14);
    doc.text(`${facture.montantTTC.toLocaleString()} FCFA`, 170, finalY + 14, { align: 'right' });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Merci pour votre confiance. Cette facture est générée électroniquement.', 105, 280, { align: 'center' });
    doc.text('Conditions de paiement: 30 jours nets | IBAN: CI00 0000 0000 0000 0000', 105, 285, { align: 'center' });
    
    return doc;
  };

  const handleDownloadPDF = (facture) => {
    const doc = generateInvoicePDF(facture);
    doc.save(`${facture.id}.pdf`);
    toast.success(`Facture ${facture.id} téléchargée.`);
  };

  const handleSendEmail = (facture) => {
    // Simuler l'envoi d'email
    toast.success(`Facture ${facture.id} envoyée à ${facture.client}.`);
  };

  const handleBulkExport = () => {
    if (filteredFactures.length === 0) {
      toast.error('Aucune facture à exporter.');
      return;
    }

    // Générer un PDF consolidé
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE FACTURATION', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période: ${selectedPeriod}`, 20, 30);
    doc.text(`Total factures: ${filteredFactures.length}`, 20, 36);
    doc.text(`Montant total: ${stats.montantTotal.toLocaleString()} FCFA`, 20, 42);
    
    autoTable(doc, {
      startY: 50,
      head: [['N° Facture', 'Client', 'Date', 'Produit', 'Quantité', 'Montant TTC']],
      body: filteredFactures.map(f => [
        f.id,
        f.client,
        new Date(f.date).toLocaleDateString('fr-FR'),
        f.produit,
        `${f.quantite.toLocaleString()} L`,
        `${f.montantTTC.toLocaleString()} FCFA`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [255, 122, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });
    
    doc.save(`Rapport_Facturation_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport de facturation exporté.');
  };

  return (
    <MainLayout title="Facturation" subtitle="Gérez vos factures et encaissements">
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Factures</span>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Montant Total</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-xl font-bold text-green-600">{stats.montantTotal.toLocaleString()} FCFA</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Payées</span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.payees}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En Attente</span>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par N°, client, BL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="tous">Tous les statuts</option>
            <option value="payee">Payées</option>
            <option value="en-attente">En Attente</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="mois-en-cours">Mois en cours</option>
            <option value="mois-dernier">Mois dernier</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>

          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
          >
            <Download className="w-5 h-5" />
            Exporter Tout
          </button>
        </div>

        {/* Factures Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFactures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{facture.id}</span>
                      <p className="text-xs text-gray-500">BL: {facture.numeroBL}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{facture.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(facture.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{facture.produit}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {facture.quantite.toLocaleString()} L
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      {facture.montantTTC.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        facture.statut === 'payee'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {facture.statut === 'payee' ? 'Payée' : 'En Attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPDF(facture)}
                          className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(facture)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="Envoyer par email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Facturation;
