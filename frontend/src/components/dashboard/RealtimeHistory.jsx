import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Package, Truck, AlertTriangle, CheckCircle, Droplet } from 'lucide-react';

const RealtimeHistory = () => {
  const { alertes, commandes, bonsLivraison } = useApp();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Créer un historique d'événements à partir de toutes les sources
    const allEvents = [];

    // Ajouter les alertes récentes
    alertes.slice(0, 10).forEach((alerte) => {
      allEvents.push({
        id: alerte.id,
        timestamp: alerte.timestamp,
        type: alerte.type,
        icon: getIconForType(alerte.type),
        color: getColorForSeverity(alerte.severite),
        title: alerte.titre,
        description: alerte.message,
      });
    });

    // Trier par date décroissante
    allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setEvents(allEvents.slice(0, 15));
  }, [alertes, commandes, bonsLivraison]);

  const getIconForType = (type) => {
    switch (type) {
      case 'stock':
        return Droplet;
      case 'retard':
        return Clock;
      case 'deviation':
        return AlertTriangle;
      case 'maintenance':
        return Truck;
      case 'livraison':
        return Package;
      default:
        return CheckCircle;
    }
  };

  const getColorForSeverity = (severite) => {
    switch (severite) {
      case 'critique':
        return 'text-red-500 bg-red-50';
      case 'urgent':
        return 'text-orange-500 bg-orange-50';
      case 'attention':
        return 'text-yellow-500 bg-yellow-50';
      case 'info':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now - eventTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return eventTime.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Historique en Temps Réel</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">LIVE</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun événement récent</p>
          </div>
        ) : (
          events.map((event) => {
            const Icon = event.icon;
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className={`p-2 rounded-lg ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(event.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RealtimeHistory;
