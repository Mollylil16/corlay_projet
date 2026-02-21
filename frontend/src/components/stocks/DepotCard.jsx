import React from 'react';
import ProductStockBar from './ProductStockBar';
import { MapPin } from 'lucide-react';

const DepotCard = ({ depot }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-1">
            {depot.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{depot.location}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[depot.status]}`}>
          {statusLabels[depot.status]}
        </span>
      </div>

      {/* Products */}
      <div className="space-y-1 divide-y divide-gray-100">
        {depot.products.map((product, index) => (
          <ProductStockBar key={index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default DepotCard;
