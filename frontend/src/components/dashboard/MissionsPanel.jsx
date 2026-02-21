import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Package, MapPin, Truck, ArrowRight } from 'lucide-react';

const MissionsPanel = () => {
  const { commandes, bonsLivraison } = useApp();
  const [activeTab, setActiveTab] = useState('a-assigner');

  const commandesAAssigner = commandes.filter(
    (c) => c.statut === 'validee' && !bonsLivraison.some((bl) => String(bl.numeroCommande) === String(c.id))
  );
  const blEnAttente = bonsLivraison.filter((bl) => bl.statut === 'en-attente');
  const blEnTransit = bonsLivraison.filter((bl) => bl.statut === 'en-transit');
  const blTerminees = bonsLivraison.filter((bl) => bl.statut === 'livre' || bl.statut === 'livré');

  const tabs = [
    { id: 'a-assigner', label: 'À ASSIGNER', count: commandesAAssigner.length },
    { id: 'assignees', label: 'ASSIGNÉES', count: blEnAttente.length },
    { id: 'en-cours', label: 'EN COURS', count: blEnTransit.length },
    { id: 'terminees', label: 'TERMINÉES', count: blTerminees.length },
  ];

  const missions = {
    'a-assigner': commandesAAssigner.map((c) => ({
      id: `CMD-${c.id}`,
      client: c.client,
      product: c.type || c.typeCarburant || 'Carburant',
      quantity: `${Number(c.quantite || 0).toLocaleString('fr-FR')} L`,
      time: c.date || 'Aujourd\'hui',
      priority: c.priorite || 'normal',
    })),
    'assignees': blEnAttente.map((bl) => ({
      id: bl.numeroBL || `BL-${bl.id}`,
      client: bl.client,
      product: bl.typeCarburant,
      quantity: `${Number(bl.quantiteCommandee || 0).toLocaleString('fr-FR')} L`,
      driver: `${bl.chauffeur} • ${bl.vehicule}`,
      priority: 'normal',
    })),
    'en-cours': blEnTransit.map((bl) => ({
      id: bl.numeroBL || `BL-${bl.id}`,
      client: bl.client,
      product: bl.typeCarburant,
      quantity: `${Number(bl.quantiteCommandee || 0).toLocaleString('fr-FR')} L`,
      driver: `${bl.chauffeur} • ${bl.vehicule}`,
      eta: 'En route',
    })),
    'terminees': blTerminees.map((bl) => ({
      id: bl.numeroBL || `BL-${bl.id}`,
      client: bl.client,
      product: bl.typeCarburant,
      quantity: `${Number(bl.quantiteLivree ?? (bl.quantiteCommandee || 0)).toLocaleString('fr-FR')} L`,
      driver: bl.chauffeur,
    })),
  };

  const priorityColors = {
    critique: 'bg-red-100 text-red-700 border-red-300',
    urgent: 'bg-orange-100 text-orange-700 border-orange-300',
    normal: 'bg-blue-100 text-blue-700 border-blue-300',
  };

  const priorityLabels = {
    critique: 'CRITIQUE',
    urgent: 'URGENT',
    normal: 'NORMAL',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold text-gray-900">Missions en cours</h2>
        <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      <div className="p-6">
        {missions[activeTab]?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions[activeTab].map((mission) => (
              <div
                key={mission.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">{mission.id}</span>
                    {mission.priority && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${priorityColors[mission.priority]}`}>
                        {priorityLabels[mission.priority]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Client */}
                <h4 className="font-semibold text-gray-900 mb-3">{mission.client}</h4>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span>{mission.product} • {mission.quantity}</span>
                  </div>
                  
                  {mission.time && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{mission.time}</span>
                    </div>
                  )}
                  
                  {mission.driver && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>{mission.driver}</span>
                    </div>
                  )}
                  
                  {mission.eta && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <MapPin className="w-4 h-4" />
                      <span>{mission.eta}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Package className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">
              {activeTab === 'terminees' ? 'Missions livrées (données serveur)' : 'Aucune mission dans cette catégorie'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionsPanel;
