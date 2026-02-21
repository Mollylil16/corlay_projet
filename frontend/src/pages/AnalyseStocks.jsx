import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import { TrendingUp, TrendingDown, AlertTriangle, Database, Download, DollarSign, Droplet, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const AnalyseStocks = () => {
  const { stocks, bonsLivraison, commandes } = useApp();
  const [selectedDepot, setSelectedDepot] = useState('tous');

  // Calculer les écarts théoriques vs physiques (données dépôts ; théorique = physique si pas de mouvement dédié)
  const calculateVariances = () => {
    const variances = [];

    (stocks.depots || []).forEach((depot) => {
      (depot.tanks || []).forEach((tank) => {
        const physicalStock = Number(tank.current) ?? 0;
        const capacity = Number(tank.capacity) ?? 1;
        const theoreticalStock = physicalStock;
        const variance = 0;
        const variancePercent = 0;

        variances.push({
          depot: depot.nom || depot.id,
          tank: tank.id,
          produit: tank.type || tank.id,
          capacite: capacity,
          physicalStock,
          theoreticalStock: Math.max(0, theoreticalStock),
          variance,
          variancePercent,
          status: 'normal',
        });
      });
    });

    return variances;
  };

  const variances = calculateVariances();

  // Filtrer par dépôt
  const filteredVariances = selectedDepot === 'tous'
    ? variances
    : variances.filter((v) => v.depot === selectedDepot);

  // Stats
  const stats = {
    total: filteredVariances.length,
    normal: filteredVariances.filter((v) => v.status === 'normal').length,
    attention: filteredVariances.filter((v) => v.status === 'attention').length,
    critique: filteredVariances.filter((v) => v.status === 'critique').length,
    totalEcart: filteredVariances.reduce((sum, v) => sum + Math.abs(v.variance), 0),
  };

  // Valorisation (prix moyen par produit en FCFA)
  const prixMoyens = {
    Gasoil: 650,
    Super: 750,
    Diesel: 700,
  };

  const valorisationEcarts = filteredVariances.map((v) => ({
    ...v,
    valeurEcart: Math.abs(v.variance) * (prixMoyens[v.produit] || 700),
  }));

  const valeurTotaleEcarts = valorisationEcarts.reduce((sum, v) => sum + v.valeurEcart, 0);

  // Données pour graphique
  const chartData = filteredVariances.map((v) => ({
    name: `${v.depot}-${v.tank}`,
    Théorique: Math.round(v.theoreticalStock),
    Physique: Math.round(v.physicalStock),
    Écart: Math.round(v.variance),
  }));

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSE DES ÉCARTS DE STOCKS', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
      doc.text(`Dépôt: ${selectedDepot === 'tous' ? 'Tous les dépôts' : selectedDepot}`, 20, 36);

      doc.text(`Total cuves: ${stats.total}`, 20, 46);
      doc.text(`Normales: ${stats.normal} | Attention: ${stats.attention} | Critiques: ${stats.critique}`, 20, 52);
      doc.text(`Valeur totale des écarts: ${Number(valeurTotaleEcarts).toLocaleString('fr-FR')} FCFA`, 20, 58);

      let startY = 65;
      if (valorisationEcarts.length > 0) {
        autoTable(doc, {
          startY,
          head: [['Dépôt', 'Cuve', 'Produit', 'Théorique (L)', 'Physique (L)', 'Écart (L)', 'Écart (%)', 'Valeur (FCFA)']],
          body: valorisationEcarts.map((v) => [
            String(v.depot),
            String(v.tank),
            String(v.produit),
            Math.round(v.theoreticalStock).toLocaleString('fr-FR'),
            Math.round(v.physicalStock).toLocaleString('fr-FR'),
            Math.round(v.variance).toLocaleString('fr-FR'),
            (Number(v.variancePercent) || 0).toFixed(2) + '%',
            Number(v.valeurEcart || 0).toLocaleString('fr-FR'),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        });
      } else {
        doc.text('Aucune donnée de cuve à afficher.', 20, startY);
      }

      doc.save(`Analyse_Ecarts_Stocks_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Rapport exporté en PDF.');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'export PDF.');
    }
  };

  return (
    <MainLayout title="Analyse des Écarts de Stocks" subtitle="Suivi théorique vs physique">
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Cuves</span>
              <Database className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Normales</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Attention</span>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.attention}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Critiques</span>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.critique}</div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Valeur Écarts</span>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-purple-600">
              {valeurTotaleEcarts.toLocaleString()} FCFA
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <select
            value={selectedDepot}
            onChange={(e) => setSelectedDepot(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="tous">Tous les dépôts</option>
            {(stocks?.depots || []).map((depot) => (
              <option key={depot.id} value={depot.nom}>
                {depot.nom}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
          >
            <Download className="w-5 h-5" />
            Exporter PDF
          </button>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Comparaison Théorique vs Physique
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Théorique" fill="#3b82f6" />
              <Bar dataKey="Physique" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Variance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-900">Détail des Écarts par Cuve</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Dépôt</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cuve</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Stock Théorique</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Stock Physique</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Écart (L)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Écart (%)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Valeur (FCFA)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {valorisationEcarts.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{v.depot}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{v.tank}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{v.produit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{v.capacite.toLocaleString()} L</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {Math.round(v.theoreticalStock).toLocaleString()} L
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {Math.round(v.physicalStock).toLocaleString()} L
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {v.variance > 0 ? '+' : ''}
                      {Math.round(v.variance).toLocaleString()} L
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      <span
                        className={`${
                          Math.abs(v.variancePercent) < 2
                            ? 'text-green-600'
                            : Math.abs(v.variancePercent) < 5
                            ? 'text-orange-600'
                            : 'text-red-600'
                        }`}
                      >
                        {v.variancePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-purple-600">
                      {v.valeurEcart.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'normal'
                            ? 'bg-green-100 text-green-700'
                            : v.status === 'attention'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
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

export default AnalyseStocks;
