import React from 'react';
import { Truck, MapPin, Star, DollarSign, Package as PackageIcon, CheckCircle } from 'lucide-react';

const TransporteurCard = ({ transporteur, isRecommended, onSelect }) => {
  const statusColors = {
    disponible: 'bg-green-500',
    'en-mission': 'bg-orange-500',
    maintenance: 'bg-red-500',
  };

  const statusLabels = {
    disponible: 'Disponible',
    'en-mission': 'En mission',
    maintenance: 'Maintenance',
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 transition-all ${
        isRecommended
          ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-bold text-orange-600 uppercase">
            Recommandé par IA
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Truck className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{transporteur.immatriculation}</h4>
            <p className="text-xs text-gray-500">{transporteur.chauffeur}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusColors[transporteur.statut]}`}></div>
      </div>

      {/* Specs */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Capacité:</span>
          <span className="font-medium text-gray-900">{transporteur.capacite}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium text-gray-900">{transporteur.typeVehicule}</span>
        </div>

        {transporteur.position && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{transporteur.position}</span>
          </div>
        )}
      </div>

      {/* Cost & Performance */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 bg-green-50 rounded text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Coût</span>
          </div>
          <div className="text-sm font-bold text-green-900">{transporteur.cout}</div>
        </div>
        
        <div className="p-2 bg-blue-50 rounded text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Taux</span>
          </div>
          <div className="text-sm font-bold text-blue-900">{transporteur.tauxPonctualite}%</div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelect(transporteur)}
        disabled={transporteur.statut !== 'disponible'}
        className={`w-full py-2 rounded font-medium text-sm transition-colors ${
          transporteur.statut === 'disponible'
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {transporteur.statut === 'disponible' ? 'Sélectionner' : statusLabels[transporteur.statut]}
      </button>
    </div>
  );
};

export default TransporteurCard;
