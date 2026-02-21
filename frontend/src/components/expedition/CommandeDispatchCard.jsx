import React from 'react';
import { Package, MapPin, Clock, AlertTriangle, Droplet } from 'lucide-react';

const CommandeDispatchCard = ({ commande, onAssign }) => {
  const priorityColors = {
    critique: 'bg-red-100 text-red-700 border-red-300',
    urgent: 'bg-orange-100 text-orange-700 border-orange-300',
    normale: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const priorityLabels = {
    critique: 'CRITIQUE',
    urgent: 'URGENT',
    normale: 'NORMALE',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-move">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-medium text-gray-500">{commande.id}</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded border font-medium ${priorityColors[commande.priorite]}`}>
            {priorityLabels[commande.priorite]}
          </span>
        </div>
        {commande.priorite === 'critique' && (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
      </div>

      {/* Client */}
      <h4 className="font-semibold text-gray-900 mb-3">{commande.client}</h4>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Droplet className="w-4 h-4 flex-shrink-0" />
          <span>{commande.produit} • {commande.quantite}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{commande.destination}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{commande.dateLivraison}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Distance: {commande.distance}
        </div>
        <button
          onClick={() => onAssign(commande)}
          className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
        >
          Assigner
        </button>
      </div>
    </div>
  );
};

export default CommandeDispatchCard;
