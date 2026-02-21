import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';
import MainLayout from '../components/layout/MainLayout';
import VehicleCard from '../components/suivi/VehicleCard';
import LiveMapLeaflet from '../components/suivi/LiveMapLeaflet';
import LiveStats from '../components/suivi/LiveStats';
import DeviationAlert from '../components/suivi/DeviationAlert';
import { Search, CheckCircle } from 'lucide-react';

const Suivi = () => {
  const { vehicles } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [ignoredDeviationIds, setIgnoredDeviationIds] = useState(new Set());

  // Alerte de déviation dynamique : affichée uniquement si un véhicule a hasDeviation === true (données API)
  const vehicleWithDeviation = vehicles.find(
    (v) => v.hasDeviation && !ignoredDeviationIds.has(v.id)
  );
  const alert = vehicleWithDeviation
    ? {
        vehicleId: `Camion ${vehicleWithDeviation.id}`,
        severity: 'CRITIQUE',
        message: `Le véhicule a quitté l'itinéraire prévu. Position actuelle : ${vehicleWithDeviation.route || 'non communiquée'}.`,
      }
    : null;

  const activeVehiclesCount = vehicles.length;

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIgnoreAlert = () => {
    if (vehicleWithDeviation) {
      setIgnoredDeviationIds((prev) => new Set(prev).add(vehicleWithDeviation.id));
    }
  };

  const handleContactDriver = () => {
    if (!vehicleWithDeviation) return;
    const vehicle = vehicleWithDeviation;
    toast.success(`Appel en cours vers ${vehicle.driver}...`, {
      autoClose: 3000,
    });
    setTimeout(() => {
      setIgnoredDeviationIds((prev) => new Set(prev).add(vehicle.id));
      toast.info(`Contact établi avec ${vehicle.driver}. Problème résolu.`);
    }, 2000);
  };

  return (
    <MainLayout
      title="Suivi Flotte Live"
      subtitle={activeVehiclesCount === 0 ? 'Aucun camion sur le réseau' : `${activeVehiclesCount} camion${activeVehiclesCount !== 1 ? 's' : ''} actif${activeVehiclesCount !== 1 ? 's' : ''} sur le réseau`}
    >
      <div className="p-6 bg-gray-50">
        <LiveStats />
      </div>
      <div className="flex h-[calc(100vh-240px)]">
        {/* Left Sidebar - Vehicle List */}
        <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* System Status Badge */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">SYSTÈME OPÉRATIONNEL</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrer les missions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isActive={selectedVehicle?.id === vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">
                  {vehicles.length === 0
                    ? 'Aucun camion. En production, vos véhicules apparaîtront ici après assignation de missions.'
                    : 'Aucun véhicule ne correspond à la recherche.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Map */}
          <div className="flex-1 p-6">
            <LiveMapLeaflet
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
            />
          </div>

          {/* Deviation Alert */}
          {alert && (
            <div className="absolute bottom-0 left-0 right-0">
              <DeviationAlert
                alert={alert}
                onIgnore={handleIgnoreAlert}
                onContact={handleContactDriver}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Suivi;
