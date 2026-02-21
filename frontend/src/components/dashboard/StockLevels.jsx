import React from 'react';
import { useApp } from '../../context/AppContext';

const productColors = {
  Diesel: 'bg-gray-800',
  Gasoil: 'bg-gray-700',
  Essence: 'bg-green-500',
  Super: 'bg-green-600',
  Kérosène: 'bg-orange-500',
  'Jet A-1': 'bg-cyan-500',
  default: 'bg-blue-500',
};

const StockLevels = () => {
  const { stocks: stocksContext } = useApp();
  const tanks = (stocksContext?.depots || []).flatMap((d) =>
    (d.tanks || []).map((t) => ({
      product: t.type || t.id || 'Produit',
      current: Number(t.current) ?? 0,
      capacity: Number(t.capacity) ?? 1,
      depot: d.nom || d.id,
    }))
  );
  const stocks = tanks.map((t) => ({
    product: t.product,
    current: t.current,
    capacity: t.capacity,
    percentage: t.capacity ? Math.round((t.current / t.capacity) * 100) : 0,
    color: productColors[t.product] || productColors.default,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Niveaux de stock (dépôts)</h3>

      {/* Stock Items */}
      <div className="space-y-4">
        {stocks.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun réservoir. Données depuis le serveur.</p>
        ) : stocks.map((stock) => (
          <div key={stock.product}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{stock.product}</span>
              <span className="text-sm font-semibold text-gray-900">{stock.percentage}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${stock.color} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${stock.percentage}%` }}
              ></div>
            </div>
            
            {/* Capacity Info */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{stock.current.toLocaleString()} L</span>
              <span>Cap. {(stock.capacity / 1000).toFixed(0)}k L</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">NOUVEAU</h4>
            <p className="text-xs text-gray-700 mb-2">
              Optimisation d'itinéraire par IA disponible.
            </p>
            <button className="text-xs font-semibold text-green-700 hover:text-green-800 uppercase">
              ACTIVER LE MODULE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLevels;
