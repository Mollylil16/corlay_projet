import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Truck } from 'lucide-react';

const FleetMap = () => {
  const { vehicles } = useApp();
  const trucks = vehicles.map((v, i) => ({
    id: v.id,
    name: v.driver || v.id,
    location: v.destination || 'Dépôt',
    status: v.status === 'transit' ? 'transit' : 'dispo',
    position: { top: `${20 + (i % 3) * 25}%`, left: `${25 + (i % 4) * 20}%` },
  }));

  const statusColors = {
    dispo: 'bg-green-500',
    transit: 'bg-orange-500',
  };

  const statusLabels = {
    dispo: 'DISPO',
    transit: 'TRANSIT',
  };

  const dispoCount = trucks.filter((t) => t.status === 'dispo').length;
  const transitCount = trucks.filter((t) => t.status === 'transit').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold text-gray-900">Suivi de Flotte</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">{dispoCount} DISPO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">{transitCount} TRANSIT</span>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative bg-[#2a3f5f] h-96">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Trucks on Map */}
        {trucks.map((truck) => (
          <div
            key={truck.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: truck.position.top, left: truck.position.left }}
          >
            {/* Truck Icon */}
            <div className={`${statusColors[truck.status]} p-3 rounded-lg shadow-lg`}>
              <Truck className="w-6 h-6 text-white" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-white rounded-lg shadow-lg p-3 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">{truck.name}</div>
                {truck.location && (
                  <div className="text-xs text-gray-500 mt-1">{truck.location}</div>
                )}
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[truck.status]}`}>
                    {statusLabels[truck.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Depot Marker */}
        <div className="absolute top-[40%] left-[30%] transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetMap;
