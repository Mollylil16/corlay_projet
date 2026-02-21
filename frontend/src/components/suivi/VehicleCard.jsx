import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const VehicleCard = ({ vehicle, isActive, onClick }) => {
  const statusColors = {
    transit: 'bg-orange-100 text-orange-700',
    chargement: 'bg-blue-100 text-blue-700',
    livraison: 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    transit: 'TRANSIT',
    chargement: 'CHARGEMENT',
    livraison: 'LIVRAISON',
  };

  const progressColors = {
    transit: 'bg-orange-500',
    chargement: 'bg-blue-500',
    livraison: 'bg-green-500',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? 'border-orange-500 bg-orange-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{vehicle.id}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[vehicle.status]}`}>
          {statusLabels[vehicle.status]}
        </span>
      </div>

      {/* Driver Name */}
      <h4 className="font-semibold text-gray-900 mb-1">{vehicle.driver}</h4>

      {/* Destination */}
      <div className="flex items-start gap-1.5 text-xs text-gray-600 mb-3">
        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>Vers: {vehicle.destination}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${progressColors[vehicle.status]} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${vehicle.progress}%` }}
          ></div>
        </div>
      </div>

      {/* ETA */}
      {vehicle.eta && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>ETA: {vehicle.eta}</span>
        </div>
      )}
    </div>
  );
};

export default VehicleCard;
