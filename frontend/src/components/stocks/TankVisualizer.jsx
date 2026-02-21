import React from 'react';
import { Fuel, Droplet, Plane, Ship } from 'lucide-react';

const TankVisualizer = ({ tank }) => {
  const icons = {
    diesel: Fuel,
    essence: Droplet,
    kerosene: Plane,
    maritime: Ship,
  };

  const Icon = icons[tank.type] || Fuel;

  // Couleurs de gradient selon le type de carburant
  const gradients = {
    diesel: 'from-blue-600 via-blue-500 to-blue-400',
    essence: 'from-purple-600 via-purple-500 to-purple-400',
    kerosene: 'from-cyan-500 via-cyan-400 to-cyan-300',
    maritime: 'from-gray-700 via-gray-600 to-gray-500',
  };

  const isLow = tank.percentage < 30;
  const isCritical = tank.percentage < 15;

  return (
    <div className="bg-gray-50 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
      {/* Tank Visual Container */}
      <div className="relative h-40 bg-white rounded-xl overflow-hidden mb-4 shadow-inner">
        {/* Wave/Liquid Effect */}
        <div
          className={`absolute bottom-0 w-full transition-all duration-700 ease-out bg-gradient-to-br ${
            gradients[tank.type]
          }`}
          style={{ height: `${tank.percentage}%` }}
        >
          {/* First Wave Layer - Main */}
          <div className="absolute top-0 left-0 w-full">
            <svg
              className="w-full h-12 transform -translate-y-1/2"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,20 C200,50 400,10 600,30 C800,50 1000,10 1200,20 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.4)"
                className="animate-wave"
              />
            </svg>
          </div>

          {/* Second Wave Layer - Medium Speed */}
          <div className="absolute top-0 left-0 w-full">
            <svg
              className="w-full h-12 transform -translate-y-1/2"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,30 C250,10 450,50 600,20 C750,50 950,10 1200,40 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.25)"
                className="animate-wave-slow"
              />
            </svg>
          </div>

          {/* Third Wave Layer - Slow Ripple */}
          <div className="absolute top-0 left-0 w-full">
            <svg
              className="w-full h-12 transform -translate-y-1/2"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,10 C300,40 500,5 600,25 C700,5 900,40 1200,15 L1200,120 L0,120 Z"
                fill="rgba(255,255,255,0.15)"
                className="animate-wave-ripple"
              />
            </svg>
          </div>

          {/* Shimmer Effect on Liquid Surface */}
          <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white/20 to-transparent animate-pulse" 
               style={{ animationDuration: '3s' }}></div>

          {/* Percentage Label on Liquid */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold text-2xl drop-shadow-lg">
              {tank.percentage}%
            </div>
          </div>
        </div>

        {/* Empty State - Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`grid-${tank.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${tank.id})`} />
          </svg>
        </div>

        {/* Icon in top corner */}
        <div className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-lg">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      {/* Tank Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {tank.tankNumber}
            </div>
            <div className="text-sm font-semibold text-gray-900">{tank.name}</div>
          </div>
          {(isLow || isCritical) && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">
              {isCritical ? 'CRITIQUE' : 'LOW'}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-xl font-bold text-gray-900">
            {tank.current.toLocaleString()} L
          </div>
          <div className="text-xs text-gray-500">
            Cap: {tank.capacity.toLocaleString()}L
          </div>
        </div>
      </div>
    </div>
  );
};

export default TankVisualizer;
