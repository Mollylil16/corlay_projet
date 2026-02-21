import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, AlertTriangle, Gauge, MapPin, Clock } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix pour les icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fonction pour créer une icône personnalisée pour les camions
const createTruckIcon = (status, hasDeviation = false) => {
  const statusColors = {
    transit: '#f97316', // orange
    chargement: '#3b82f6', // blue
    livraison: '#10b981', // green
  };

  const color = statusColors[status] || '#f97316';

  const iconHtml = renderToString(
    <div style={{ position: 'relative' }}>
      <div
        style={{
          backgroundColor: color,
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          border: '2px solid white',
        }}
      >
        <Truck color="white" size={20} />
      </div>
      {hasDeviation && (
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            padding: '4px',
            animation: 'pulse 2s infinite',
          }}
        >
          <AlertTriangle color="white" size={12} />
        </div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-truck-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Composant pour animer les véhicules
const AnimatedMarker = ({ vehicle, isSelected, onVehicleSelect }) => {
  const [position, setPosition] = useState(vehicle.position);
  const map = useMap();

  useEffect(() => {
    // Animation du mouvement du véhicule
    const interval = setInterval(() => {
      setPosition((prev) => {
        // Petite variation aléatoire pour simuler le mouvement
        const newLat = prev[0] + (Math.random() - 0.5) * 0.001;
        const newLng = prev[1] + (Math.random() - 0.5) * 0.001;
        return [newLat, newLng];
      });
    }, 3000); // Mise à jour toutes les 3 secondes

    return () => clearInterval(interval);
  }, []);

  // Centrer la carte sur le véhicule sélectionné
  useEffect(() => {
    if (isSelected) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [isSelected, position, map]);

  return (
    <Marker
      position={position}
      icon={createTruckIcon(vehicle.status, vehicle.hasDeviation)}
      eventHandlers={{
        click: () => onVehicleSelect(vehicle),
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                vehicle.status === 'transit'
                  ? 'bg-orange-500'
                  : vehicle.status === 'chargement'
                  ? 'bg-blue-500'
                  : 'bg-green-500'
              }`}
            ></div>
            <span className="text-xs font-medium text-gray-500">{vehicle.id}</span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">{vehicle.driver}</h4>

          <div className="space-y-2 text-sm">
            {vehicle.destination && (
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span>{vehicle.destination}</span>
              </div>
            )}

            {vehicle.speed && (
              <div className="flex items-center gap-2 text-gray-700">
                <Gauge className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{vehicle.speed} km/h</span>
              </div>
            )}

            {vehicle.eta && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs">ETA: {vehicle.eta}</span>
              </div>
            )}

            {vehicle.hasDeviation && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded mt-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">DÉVIATION DÉTECTÉE</span>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Composant principal de la carte
const LiveMapLeaflet = ({ vehicles, selectedVehicle, onVehicleSelect }) => {
  // Centre sur Abidjan, Côte d'Ivoire
  const center = [5.3600, -4.0083];
  const zoom = 13;

  // Tracer les itinéraires pour les véhicules en transit
  const routes = vehicles
    .filter((v) => v.route && v.position)
    .map((v) => ({
      id: v.id,
      positions: [
        v.position,
        [v.position[0] + 0.02, v.position[1] + 0.02], // Destination simulée
      ],
      color:
        v.status === 'transit'
          ? '#f97316'
          : v.status === 'chargement'
          ? '#3b82f6'
          : '#10b981',
    }));

  return (
    <div className="relative h-full rounded-xl overflow-hidden shadow-xl">
      {vehicles.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/30 rounded-xl">
          <div className="bg-white px-6 py-5 rounded-xl shadow-lg text-center max-w-md">
            <p className="text-gray-800 font-semibold">Aucun camion sur la carte</p>
            <p className="text-sm text-gray-600 mt-2">En production, vos véhicules apparaîtront ici après assignation de missions. Pas de données fictives.</p>
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        {/* Couche de tuiles OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Tracer les itinéraires */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            color={route.color}
            weight={3}
            opacity={0.6}
            dashArray="10, 10"
          />
        ))}

        {/* Marqueurs des véhicules avec animation */}
        {vehicles.map((vehicle) => (
          <AnimatedMarker
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={selectedVehicle?.id === vehicle.id}
            onVehicleSelect={onVehicleSelect}
          />
        ))}
      </MapContainer>

      {/* Badge système opérationnel */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Système opérationnel</span>
        </div>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
        <div className="text-xs font-semibold text-gray-700 mb-2">Statuts</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-xs text-gray-600">En transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Chargement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Livraison</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMapLeaflet;
