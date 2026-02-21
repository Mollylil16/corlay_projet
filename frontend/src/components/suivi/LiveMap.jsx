import React, { useState } from 'react';
import { Plus, Minus, Layers, Truck, AlertTriangle, Gauge } from 'lucide-react';

const LiveMap = ({ vehicles, selectedVehicle, onVehicleSelect }) => {
  const [zoom, setZoom] = useState(12);
  const [showLayers, setShowLayers] = useState(false);

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 8));

  return (
    <div className="relative h-full bg-[#1a2332] rounded-xl overflow-hidden">
      {/* Map Background with Grid Pattern */}
      <div className="absolute inset-0">
        <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-live" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(100,120,150,0.3)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-live)" />
        </svg>

        {/* Simulated roads */}
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="#4a5568" strokeWidth="3" />
          <line x1="40%" y1="10%" x2="40%" y2="90%" stroke="#4a5568" strokeWidth="3" />
          <line x1="30%" y1="60%" x2="70%" y2="60%" stroke="#4a5568" strokeWidth="2" />
        </svg>
      </div>

      {/* Vehicles on Map */}
      {vehicles.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        const statusColors = {
          transit: 'bg-orange-500',
          chargement: 'bg-blue-500',
          livraison: 'bg-green-500',
        };

        return (
          <div
            key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              top: vehicle.position.y,
              left: vehicle.position.x,
            }}
            onClick={() => onVehicleSelect(vehicle)}
          >
            {/* Vehicle Icon */}
            <div
              className={`${statusColors[vehicle.status]} ${
                isSelected ? 'ring-4 ring-white scale-110' : ''
              } p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-110`}
            >
              <Truck className="w-5 h-5 text-white" />
            </div>

            {/* Deviation Alert Icon */}
            {vehicle.hasDeviation && (
              <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Tooltip on Hover */}
            {!isSelected && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-white rounded-lg shadow-xl p-3 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{vehicle.driver}</div>
                  <div className="text-xs text-gray-500 mt-1">{vehicle.id}</div>
                  {vehicle.speed && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Gauge className="w-3 h-3" />
                      <span>{vehicle.speed} km/h</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Vehicle Popup */}
            {isSelected && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20">
                <div className="bg-white rounded-lg shadow-xl p-4 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[vehicle.status]}`}></div>
                    <span className="text-xs font-medium text-gray-500">{vehicle.id}</span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{vehicle.driver}</h4>
                  
                  <div className="space-y-1 text-sm">
                    {vehicle.speed && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{vehicle.speed} km/h</span>
                        {vehicle.route && (
                          <span className="text-gray-500">• {vehicle.route}</span>
                        )}
                      </div>
                    )}
                    
                    {vehicle.hasDeviation && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-medium">DÉVIATION DÉTECTÉE</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow pointing to vehicle */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Minus className="w-5 h-5 text-gray-700" />
        </button>

        {/* Layers */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium text-gray-700">
        Zoom: {zoom}x
      </div>
    </div>
  );
};

export default LiveMap;
