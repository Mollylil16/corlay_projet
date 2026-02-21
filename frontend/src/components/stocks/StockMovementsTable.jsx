import React from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../../context/AppContext';
import { Download, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatMovementDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const StockMovementsTable = () => {
  const { bonsLivraison } = useApp();
  const movements = bonsLivraison
    .filter((bl) => bl.statut === 'livre' || bl.statut === 'livré')
    .sort((a, b) => new Date(b.dateLivraison || b.createdAt || 0) - new Date(a.dateLivraison || a.createdAt || 0))
    .slice(0, 50)
    .map((bl) => ({
      id: bl.id,
      date: formatMovementDate(bl.dateLivraison || bl.createdAt),
      type: 'sortie',
      product: bl.typeCarburant || 'Carburant',
      volume: `- ${Number(bl.quantiteLivree ?? bl.quantiteCommandee ?? 0).toLocaleString('fr-FR')} L`,
      reference: bl.numeroBL || `BL-${bl.id}`,
      responsible: bl.chauffeur || '-',
    }));

  const typeColors = {
    entree: 'bg-green-100 text-green-700',
    sortie: 'bg-orange-100 text-orange-700',
  };

  const typeLabels = {
    entree: 'ENTRÉE',
    sortie: 'SORTIE',
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Mouvements de stock récents', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 20, 28);

      const startY = 36;
      if (movements.length > 0) {
        autoTable(doc, {
          startY,
          head: [['Date', 'Type', 'Produit', 'Volume', 'Référence', 'Responsable']],
          body: movements.map((m) => [
            String(m.date ?? ''),
            m.type === 'sortie' ? 'SORTIE' : 'ENTRÉE',
            String(m.product ?? ''),
            String(m.volume ?? ''),
            String(m.reference ?? ''),
            String(m.responsible ?? ''),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.text('Aucun mouvement à afficher.', 20, startY);
      }

      doc.save(`Mouvements_Stock_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exporté.');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'export PDF.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          Mouvements de Stock Récents
        </h2>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          EXPORTER PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DATE
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TYPE
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PRODUIT
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VOLUME
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° BL / RÉFÉRENCE
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RESPONSABLE
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun mouvement de stock (données dérivées des bons de livraison livrés).
                </td>
              </tr>
            ) : movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      typeColors[movement.type]
                    }`}
                  >
                    {typeLabels[movement.type]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {movement.product}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-semibold ${
                      movement.type === 'entree' ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {movement.volume}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {movement.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{movement.responsible}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementsTable;
