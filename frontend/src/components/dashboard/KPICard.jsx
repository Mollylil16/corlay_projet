import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, unit, change, icon: Icon, trend, color = 'blue' }) => {
  const isPositive = trend === 'up';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {value}
              {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
            </h3>
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 mt-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      
      {/* Progress bar (optional) */}
      {title === "VOLUME LIVRÉ (L)" && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
