import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity } from 'lucide-react';

const SystemStatusBadge = () => {
  const { vehicles, commandes, alertes } = useApp();

  // Réel : missions (véhicules en transit) + alertes non lues
  const missionsEnCours = vehicles.filter(v => v.status === 'transit').length;
  const alertesNonLues = alertes.filter(a => !a.lu).length;

  return (
    <div className="flex items-center gap-3">
      {/* Badge LIVE */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
        </div>
        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
          Système Actif
        </span>
      </div>

      {/* Activité réelle : missions + alertes */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
        <Activity className="w-4 h-4 text-orange-600" />
        <span className="text-xs font-semibold text-orange-700">
          {missionsEnCours} mission{missionsEnCours !== 1 ? 's' : ''} en cours
          {alertesNonLues > 0 && ` · ${alertesNonLues} alerte${alertesNonLues !== 1 ? 's' : ''}`}
        </span>
      </div>
    </div>
  );
};

export default SystemStatusBadge;
