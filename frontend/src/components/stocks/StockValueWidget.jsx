import React from 'react';
import { PieChart } from 'lucide-react';

const DEFAULT_BREAKDOWN = [{ name: 'Aucun', percentage: 100, color: 'bg-gray-300' }];

const StockValueWidget = ({ totalVolume, breakdown }) => {
  const safeBreakdown = Array.isArray(breakdown) && breakdown.length > 0 ? breakdown : DEFAULT_BREAKDOWN;
  const p0 = safeBreakdown[0]?.percentage ?? 0;
  const p1 = safeBreakdown[1]?.percentage ?? 0;
  const p2 = safeBreakdown[2]?.percentage ?? 0;
  const deg0 = p0 * 3.6;
  const deg1 = (p0 + p1) * 3.6;
  const deg2 = (p0 + p1 + p2) * 3.6;
  const colors = ['#3b82f6', '#10b981', '#8b5cf6'];
  const background =
    safeBreakdown.length >= 3
      ? `conic-gradient(from 0deg, ${colors[0]} 0deg ${deg0}deg, ${colors[1]} ${deg0}deg ${deg1}deg, ${colors[2]} ${deg1}deg 360deg)`
      : safeBreakdown.length === 2
        ? `conic-gradient(from 0deg, ${colors[0]} 0deg ${deg0}deg, ${colors[1]} ${deg0}deg 360deg)`
        : `conic-gradient(from 0deg, ${colors[0]} 0deg 360deg)`;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-orange-400" />
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Valeur Totale Stock
        </h3>
      </div>

      {/* Total Volume */}
      <div className="mb-6">
        <div className="text-4xl font-bold mb-1">{totalVolume ?? '0'}</div>
        <div className="text-sm text-gray-400">Litres</div>
      </div>

      {/* Donut Chart - Simple CSS Version */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <div
            className="w-full h-full rounded-full"
            style={{ background }}
          >
            <div className="absolute inset-0 m-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-3">
        {safeBreakdown.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color ?? 'bg-gray-500'}`}></div>
              <span className="text-sm text-gray-300">{item.name}</span>
            </div>
            <span className="text-sm font-semibold">{item.percentage ?? 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockValueWidget;
