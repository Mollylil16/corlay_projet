import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Navigation, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const LiveStats = () => {
  const { vehicles } = useApp();
  const [stats, setStats] = useState({
    enTransit: 0,
    moyenne: 0,
    retards: 0,
    deviations: 0,
  });

  useEffect(() => {
    const enTransit = vehicles.filter(v => v.status === 'transit').length;
    const vitesses = vehicles.filter(v => v.status === 'transit').map(v => v.speed);
    const moyenne = vitesses.length > 0 
      ? Math.round(vitesses.reduce((a, b) => a + b, 0) / vitesses.length)
      : 0;
    const retards = vehicles.filter(v => v.status === 'transit' && v.progress < 50 && v.eta).length;
    const deviations = vehicles.filter(v => v.hasDeviation).length;

    setStats({ enTransit, moyenne, retards, deviations });
  }, [vehicles]);

  const statCards = [
    {
      label: 'Véhicules en Transit',
      value: stats.enTransit,
      icon: Truck,
      color: 'bg-orange-50 text-orange-600',
      badge: 'LIVE',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Vitesse Moyenne',
      value: `${stats.moyenne} km/h`,
      icon: Navigation,
      color: 'bg-blue-50 text-blue-600',
      badge: 'Temps Réel',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Retards Potentiels',
      value: stats.retards,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      badge: stats.retards > 0 ? 'Attention' : 'OK',
      badgeColor: stats.retards > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700',
    },
    {
      label: 'Déviations',
      value: stats.deviations,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      badge: stats.deviations > 0 ? 'Alerte' : 'Normal',
      badgeColor: stats.deviations > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveStats;
