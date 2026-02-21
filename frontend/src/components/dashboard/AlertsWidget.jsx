import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock, TrendingDown, Droplet, MapPin } from 'lucide-react';

const AlertsWidget = () => {
  const { alertes } = useApp();
  
  // Prendre les 5 dernières alertes non lues
  const recentAlerts = alertes
    .filter(alerte => !alerte.lue)
    .slice(0, 5);

  const severiteColors = {
    critique: 'text-red-600 bg-red-50',
    urgent: 'text-orange-600 bg-orange-50',
    elevee: 'text-orange-600 bg-orange-50',
    attention: 'text-yellow-600 bg-yellow-50',
    moyenne: 'text-yellow-600 bg-yellow-50',
    info: 'text-blue-600 bg-blue-50',
    faible: 'text-blue-600 bg-blue-50',
  };

  const getIcon = (type) => {
    switch (type) {
      case 'stock-critique':
        return Droplet;
      case 'retard-livraison':
        return Clock;
      case 'deviation':
        return MapPin;
      default:
        return AlertTriangle;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes</h3>
        {recentAlerts.length > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            {recentAlerts.length}
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune alerte</p>
          </div>
        ) : (
          recentAlerts.map((alerte) => {
            const Icon = getIcon(alerte.type);
            return (
              <div
                key={alerte.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${severiteColors[alerte.severite]} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{alerte.titre}</h4>
                    <p className="text-xs text-gray-500 mb-2">{alerte.message || alerte.description}</p>
                    <span className="text-xs text-gray-400">{getTimeAgo(alerte.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View History Link */}
      <button className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-700 font-medium">
        VOIR HISTORIQUE
      </button>
    </div>
  );
};

export default AlertsWidget;
