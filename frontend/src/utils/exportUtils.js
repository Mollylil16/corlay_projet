import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data to PDF
 */
export const exportToPDF = (data, columns, title = 'Rapport') => {
  const doc = new jsPDF();
  
  // Titre
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
  
  // Préparer les données pour le tableau
  const headers = columns.map(col => col.label);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      return value !== null && value !== undefined ? String(value) : '';
    })
  );
  
  // Créer le tableau
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [249, 115, 22], // Orange
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gris clair
    },
  });
  
  // Sauvegarder
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'rapport') => {
  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();
  
  // Convertir les données en worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajouter le worksheet au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Données');
  
  // Générer et télécharger le fichier
  XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
};

/**
 * Export commandes to PDF
 */
export const exportCommandesToPDF = (commandes) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'client', label: 'Client' },
    { key: 'type', label: 'Type' },
    { key: 'quantite', label: 'Quantité (L)' },
    { key: 'date', label: 'Date' },
    { key: 'statut', label: 'Statut' },
    { key: 'priorite', label: 'Priorité' },
  ];
  
  exportToPDF(commandes, columns, 'Rapport des Commandes');
};

/**
 * Export commandes to Excel
 */
export const exportCommandesToExcel = (commandes) => {
  const formattedData = commandes.map(cmd => ({
    'ID': cmd.id,
    'Client': cmd.client,
    'Type de Carburant': cmd.type,
    'Quantité (L)': cmd.quantite,
    'Date': cmd.date,
    'Statut': cmd.statut,
    'Priorité': cmd.priorite,
    'Type Commande': cmd.typeCommande || 'externe',
    'Référence Externe': cmd.referenceCommandeExterne || '-',
  }));
  
  exportToExcel(formattedData, 'commandes');
};

/**
 * Export rapports to PDF
 */
export const exportRapportToPDF = (data, titre) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(titre, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 32);
  
  // Stats
  let yPos = 50;
  doc.setFontSize(14);
  doc.text('Statistiques', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  
  Object.entries(data.stats || {}).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 20, yPos);
    yPos += 8;
  });
  
  // Tableau si données
  if (data.tableData && data.tableColumns) {
    autoTable(doc, {
      head: [data.tableColumns.map(col => col.label)],
      body: data.tableData.map(row => 
        data.tableColumns.map(col => String(row[col.key] || ''))
      ),
      startY: yPos + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
    });
  }
  
  doc.save(`${titre.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

/**
 * Export camions (flotte) to PDF.
 * @param {Array} camions - Liste des camions (avec transporteur et compartiments)
 */
export const exportCamionsToPDF = (camions) => {
  const rows = (camions || []).map((c) => {
    const capacite = (c.compartiments || []).reduce((s, comp) => s + (comp.capaciteLitres || 0), 0);
    return {
      compagnie: (c.transporteur && c.transporteur.nom) ? c.transporteur.nom : '—',
      immatriculation: c.immatriculation || '—',
      chauffeur: c.chauffeur || '—',
      capacite: `${capacite.toLocaleString('fr-FR')} L`,
      statut: c.statut === 'disponible' ? 'Disponible' : c.statut === 'en-mission' ? 'En mission' : c.statut || '—',
    };
  });
  const columns = [
    { key: 'compagnie', label: 'Compagnie' },
    { key: 'immatriculation', label: 'Immatriculation' },
    { key: 'chauffeur', label: 'Chauffeur' },
    { key: 'capacite', label: 'Capacité' },
    { key: 'statut', label: 'Statut' },
  ];
  exportToPDF(rows, columns, 'Rapport des Camions (Flotte)');
};

/** @deprecated Utiliser exportCamionsToPDF. Conservé pour compatibilité. */
export const exportTransporteursToPDF = (data) => {
  if (data && data[0] && (data[0].compartiments !== undefined || data[0].transporteur !== undefined)) {
    exportCamionsToPDF(data);
  } else {
    exportCamionsToPDF([]);
  }
};
