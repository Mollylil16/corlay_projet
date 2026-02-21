import React from 'react';
import TankVisualizer from './TankVisualizer';
import { MapPin, Layers } from 'lucide-react';

const DepotCardWithTanks = ({ depot }) => {
  const statusColors = {
    operationnel: 'bg-green-100 text-green-700',
    'niveau-bas': 'bg-orange-100 text-orange-700',
    critique: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    operationnel: 'OPÉRATIONNEL',
    'niveau-bas': 'NIVEAU BAS',
    critique: 'CRITIQUE',
  };

  // Utiliser directement les tanks du depot
  const tanks = depot.tanks || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {depot.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{depot.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{tanks.length} Cuves</span>
            </div>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase shadow-sm ${statusColors[depot.status]}`}>
          {statusLabels[depot.status]}
        </span>
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-2 gap-4">
        {tanks.map((tank) => (
          <TankVisualizer key={tank.id} tank={tank} />
        ))}
      </div>
    </div>
  );
};

export default DepotCardWithTanks;
