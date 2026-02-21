import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import KPICard from '../components/dashboard/KPICard';
import LiveMapLeaflet from '../components/suivi/LiveMapLeaflet';
import MissionsPanel from '../components/dashboard/MissionsPanel';
import MissionsChart from '../components/dashboard/MissionsChart';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import StockLevels from '../components/dashboard/StockLevels';
import RealtimeHistory from '../components/dashboard/RealtimeHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Droplet, Truck, Target, TrendingUp } from 'lucide-react';

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const Dashboard = () => {
  const { kpis, vehicles, bonsLivraison, loading, error, refetch } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filtreTypeCarburant, setFiltreTypeCarburant] = useState('tous');

  const blLivres = bonsLivraison.filter((b) => b.statut === 'livre' || b.statut === 'livré');
  const typesCarburant = ['tous', ...Array.from(new Set(blLivres.map((b) => (b.typeCarburant || 'Non renseigné').trim()).filter(Boolean))).sort()];
  const blFiltres = filtreTypeCarburant === 'tous' ? blLivres : blLivres.filter((b) => (b.typeCarburant || '').trim() === filtreTypeCarburant);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const volumeParJour = last7Days.map((d) => {
    const dayStart = d.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const volume = blFiltres
      .filter((b) => {
        const t = new Date(b.dateLivraison || b.dateEmission || b.createdAt || 0).getTime();
        return t >= dayStart && t < dayEnd;
      })
      .reduce((s, b) => s + (Number(b.quantiteLivree) || Number(b.quantiteCommandee) || 0), 0);
    return { jour: JOURS[d.getDay()], volume: Math.round(volume / 1000), date: d };
  });

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const kpiData = [
    {
      title: 'COMMANDES DU JOUR',
      value: kpis.commandesDuJour.value.toString(),
      change: `${kpis.commandesDuJour.isPositive ? '+' : ''}${kpis.commandesDuJour.trend}%`,
      trend: kpis.commandesDuJour.isPositive ? 'up' : 'down',
      subtitle: 'Volume élevé prévu PM',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'VOLUME LIVRÉ (L)',
      value: Math.floor(kpis.volumeLivre.value / 1000).toString(),
      unit: 'k',
      change: `${kpis.volumeLivre.isPositive ? '+' : ''}${kpis.volumeLivre.trend}%`,
      trend: kpis.volumeLivre.isPositive ? 'up' : 'down',
      icon: Droplet,
      color: 'green',
    },
    {
      title: 'MISSIONS EN COURS',
      value: vehicles.filter(v => v.status === 'transit').length.toString(),
      change: `${kpis.missionsEnCours.isPositive ? '+' : ''}${kpis.missionsEnCours.trend}%`,
      trend: kpis.missionsEnCours.isPositive ? 'up' : 'down',
      icon: Truck,
      color: 'orange',
    },
    {
      title: 'TAUX DE SERVICE',
      value: kpis.tauxService.value.toString(),
      unit: '%',
      subtitle: 'Objectif mensuel 95%',
      icon: Target,
      color: 'purple',
    },
  ];

  return (
    <MainLayout 
      title="Vue d'ensemble" 
      subtitle={`Dernière mise à jour : Aujourd'hui, ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
    >
      {loading && (
        <div className="mx-8 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          Chargement des données...
        </div>
      )}
      {error && (
        <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-3">
          <span className="text-red-800 text-sm">{error}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )}
      <div className="p-8">
        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900">Évolution du Volume Livré (7 derniers jours)</h3>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Type de carburant</span>
              <select
                value={filtreTypeCarburant}
                onChange={(e) => setFiltreTypeCarburant(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[160px] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {typesCarburant.map((type) => (
                  <option key={type} value={type}>
                    {type === 'tous' ? 'Tous' : type}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeParJour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="jour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}k L`}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Side - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '500px' }}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-gray-900">Suivi de Flotte</h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">{vehicles.filter(v => v.status === 'livraison').length} DISPO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-600">{vehicles.filter(v => v.status === 'transit').length} TRANSIT</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 'calc(100% - 65px)' }}>
                <LiveMapLeaflet
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onVehicleSelect={setSelectedVehicle}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Alerts and Stock */}
          <div className="space-y-6">
            <AlertsWidget />
            <StockLevels />
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique Missions */}
          <MissionsChart vehicles={vehicles} />
          
          {/* Historique en Temps Réel */}
          <RealtimeHistory />
        </div>

        {/* Missions Panel */}
        <MissionsPanel />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
