import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, TrendingUp, Wrench, Bell, Droplet, X } from 'lucide-react';
import { toast } from 'react-toastify';

const getIcon = (type) => {
  if (type === 'stock') return Droplet;
  if (type === 'maintenance') return Wrench;
  if (type === 'marche') return TrendingUp;
  return AlertTriangle;
};

const getTimeAgo = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  if (h < 24) return `Il y a ${h}h`;
  return new Date(timestamp).toLocaleDateString('fr-FR');
};

const StockAlertsWidget = () => {
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const { alertes } = useApp();
  const alerts = alertes
    .filter((a) => a.type === 'stock' || a.severite === 'critique' || a.severite === 'urgent')
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      icon: getIcon(a.type),
      iconColor: a.severite === 'critique' ? 'text-red-600 bg-red-50' : a.severite === 'urgent' ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50',
      title: a.titre,
      description: a.message,
      time: getTimeAgo(a.timestamp),
    }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Alertes stocks</h3>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 mb-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune alerte. Données en temps réel depuis le serveur.</p>
        ) : (
        alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${alert.iconColor} flex-shrink-0 h-fit`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {alert.description}
                  </p>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Manage Notifications Button */}
      <button
        type="button"
        onClick={() => setShowNotificationsModal(true)}
        className="w-full py-2.5 text-center text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
      >
        GÉRER LES NOTIFICATIONS
      </button>

      {/* Modal paramètres notifications (placeholder) */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNotificationsModal(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Paramètres des notifications</h3>
              <button type="button" onClick={() => setShowNotificationsModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vous pourrez bientôt choisir quelles alertes recevoir (stock critique, retard livraison, etc.) et par quel canal (email, in-app).
            </p>
            <button
              type="button"
              onClick={() => { setShowNotificationsModal(false); toast.info('Préférences enregistrées.'); }}
              className="w-full py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlertsWidget;
