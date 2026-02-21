import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import StatCard from '../components/rapports/StatCard';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ShoppingCart,
  Droplet,
  Truck,
  DollarSign,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Package,
  Star,
} from 'lucide-react';
import { exportRapportToPDF, exportToExcel } from '../utils/exportUtils';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const RapportsNew = () => {
  const { commandes, vehicles, bonsLivraison } = useApp();
  const [period, setPeriod] = useState('mois');

  const periods = [
    { id: 'jour', label: "Aujourd'hui" },
    { id: 'semaine', label: 'Cette semaine' },
    { id: 'mois', label: 'Ce mois' },
    { id: 'trimestre', label: 'Ce trimestre' },
    { id: 'annee', label: 'Cette année' },
  ];

  const blLivres = bonsLivraison.filter((b) => b.statut === 'livre' || b.statut === 'livré');
  const volumeTotalLivre = blLivres.reduce((s, b) => s + (Number(b.quantiteLivree) || Number(b.quantiteCommandee) || 0), 0);
  const caEstime = volumeTotalLivre * 500;

  const stats = [
    {
      title: 'Commandes Traitées',
      value: commandes.length.toString(),
      change: '-',
      trend: 'up',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Volume Livré',
      value: volumeTotalLivre >= 1e6 ? `${(volumeTotalLivre / 1e6).toFixed(1)}M` : volumeTotalLivre >= 1e3 ? `${(volumeTotalLivre / 1e3).toFixed(0)}k` : volumeTotalLivre.toString(),
      unit: 'L',
      change: '-',
      trend: 'up',
      icon: Droplet,
      color: 'green',
    },
    {
      title: 'Missions Complétées',
      value: blLivres.length.toString(),
      change: '-',
      trend: 'up',
      icon: Truck,
      color: 'orange',
    },
    {
      title: 'Chiffre d\'Affaires (est.)',
      value: caEstime >= 1e6 ? `${(caEstime / 1e6).toFixed(0)}M` : caEstime >= 1e3 ? `${(caEstime / 1e3).toFixed(0)}k` : caEstime.toString(),
      unit: 'FCFA',
      change: '-',
      trend: 'up',
      icon: DollarSign,
      color: 'purple',
    },
  ];

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.getMonth(), year: d.getFullYear(), label: MOIS_LABELS[d.getMonth()] };
  });
  const volumeData = last6Months.map(({ month, year, label }) => ({
    mois: label,
    volume: blLivres
      .filter((b) => {
        const d = new Date(b.dateLivraison || b.dateEmission || b.createdAt || 0);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((s, b) => s + (Number(b.quantiteLivree) || Number(b.quantiteCommandee) || 0), 0),
  }));

  const byType = {};
  commandes.forEach((c) => {
    const t = c.type || c.typeCarburant || 'Autre';
    byType[t] = (byType[t] || 0) + 1;
  });
  const commandesParTypeData = Object.entries(byType).map(([type, value]) => ({ type, value }));
  if (commandesParTypeData.length === 0) commandesParTypeData.push({ type: 'Aucune commande', value: 0 });

  const byClient = {};
  commandes.forEach((c) => {
    const nom = c.client || 'Non renseigné';
    if (!byClient[nom]) byClient[nom] = { volume: 0, commandes: 0 };
    byClient[nom].volume += Number(c.quantite) || 0;
    byClient[nom].commandes += 1;
  });
  const topClients = Object.entries(byClient)
    .map(([nom, data]) => ({ nom, ...data }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)
    .map((c, i) => ({
      rang: i + 1,
      nom: c.nom,
      volume: c.volume.toLocaleString('fr-FR'),
      ca: c.volume * 500 >= 1e6 ? `${(c.volume * 500 / 1e6).toFixed(0)}M` : `${(c.volume * 500 / 1e3).toFixed(0)}k`,
      commandes: c.commandes,
    }));

  // Performance : top chauffeurs/véhicules à partir des BL livrés (plus de dépendance aux anciens transporteurs)
  const missionsByChauffeur = {};
  blLivres.forEach((bl) => {
    const nom = bl.chauffeur || 'Inconnu';
    missionsByChauffeur[nom] = (missionsByChauffeur[nom] || 0) + 1;
  });
  const transporteurs = Object.entries(missionsByChauffeur)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nom], i) => ({ rang: i + 1, nom, missions: missionsByChauffeur[nom], ponctualite: 95 + (i % 4), note: 4.5 + (i % 5) / 10 }));
  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#6B7280'];

  // Export PDF
  const handleExportPDF = () => {
    const data = {
      stats: {
        'Commandes Traitées': stats[0].value,
        'Volume Livré': stats[1].value + ' ' + stats[1].unit,
        'Missions Complétées': stats[2].value,
        'Chiffre d\'Affaires': stats[3].value + ' ' + stats[3].unit,
      },
      tableData: topClients,
      tableColumns: [
        { key: 'rang', label: '#' },
        { key: 'nom', label: 'Client' },
        { key: 'volume', label: 'Volume (L)' },
        { key: 'ca', label: 'CA (FCFA)' },
        { key: 'commandes', label: 'Commandes' },
      ],
    };
    
    exportRapportToPDF(data, 'Rapport Analytics');
    toast.success('Rapport PDF téléchargé avec succès.');
  };

  // Export Excel
  const handleExportExcel = () => {
    const data = topClients.map(client => ({
      'Rang': client.rang,
      'Client': client.nom,
      'Volume (L)': client.volume,
      'Chiffre d\'Affaires (FCFA)': client.ca,
      'Nombre de Commandes': client.commandes,
    }));
    
    exportToExcel(data, 'rapport_analytics');
    toast.success('Rapport Excel téléchargé avec succès.');
  };

  return (
    <MainLayout
      title="Rapports & Analytics"
      subtitle="Analyses et statistiques détaillées"
    >
      <div className="p-8">
        {/* Header avec filtres et exports */}
        <div className="flex items-center justify-between mb-8">
          {/* Sélecteur de période */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 ml-2" />
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Boutons d'export */}
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors"
            >
              <FileText className="w-5 h-5" />
              Exporter PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm transition-colors"
            >
              <Download className="w-5 h-5" />
              Exporter Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Graphique Volume par mois */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Volume Livré par Mois
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${(value / 1000000).toFixed(1)}M L`}
                />
                <Legend />
                <Bar 
                  dataKey="volume" 
                  fill="#f97316" 
                  name="Volume (L)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Répartition par type */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Répartition par Type de Carburant
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commandesParTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {commandesParTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Évolution Volume */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du Volume Livré
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M L`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#f97316" 
                strokeWidth={3}
                name="Volume (L)"
                dot={{ fill: '#f97316', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tableaux */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top 5 Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Top 5 Clients</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topClients.map((client) => (
                    <tr key={client.rang} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-sm">
                          {client.rang}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.volume} L</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.ca} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chauffeurs (basé sur les BL livrés) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Performance Chauffeurs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transporteurs.map((t) => (
                    <tr key={t.rang} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold text-sm">
                          {t.rang}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.missions}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium text-gray-900">{t.note}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RapportsNew;
