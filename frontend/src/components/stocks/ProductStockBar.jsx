import React from 'react';
import { Fuel, Droplet, Plane, Ship } from 'lucide-react';

const ProductStockBar = ({ product }) => {
  const icons = {
    diesel: Fuel,
    essence: Droplet,
    kerosene: Plane,
    maritime: Ship,
  };

  const Icon = icons[product.type] || Fuel;

  const getBarColor = () => {
    if (product.alert === 'critique') return 'bg-red-500';
    if (product.alert === 'bas') return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getAlertBadge = () => {
    if (product.alert === 'critique') {
      return (
        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium uppercase">
          Seuil Critique
        </span>
      );
    }
    if (product.alert === 'ravitaillement') {
      return (
        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-medium uppercase">
          Alerte Ravitaillement
        </span>
      );
    }
    if (product.alert === 'mort') {
      return (
        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium uppercase">
          Stock Mort
        </span>
      );
    }
    return null;
  };

  return (
    <div className="py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{product.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {getAlertBadge()}
          <span className="text-sm font-bold text-gray-900">
            {product.current.toLocaleString()} L
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${getBarColor()} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${product.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>MIN: {product.min.toLocaleString()}L</span>
        <span>CAP: {product.capacity.toLocaleString()}L</span>
      </div>
    </div>
  );
};

export default ProductStockBar;
