import React from 'react';
import Modal from '../common/Modal';
import { Package, Calendar, DollarSign, AlertCircle, CheckCircle, Truck, User } from 'lucide-react';

const CommandeDetailsModal = ({ commande, onClose }) => {
  if (!commande) return null;

  const getStatusColor = (statut) => {
    const colors = {
      NOUVELLE: 'bg-blue-100 text-blue-700 border-blue-200',
      VALIDEE: 'bg-green-100 text-green-700 border-green-200',
      'EN-TRANSIT': 'bg-orange-100 text-orange-700 border-orange-200',
      LIVREE: 'bg-gray-900 text-white border-gray-900',
      ANNULEE: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[statut] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityBadge = (priorite) => {
    const badges = {
      critique: { color: 'bg-red-500', label: 'CRITIQUE' },
      urgent: { color: 'bg-orange-500', label: 'URGENT' },
      normale: { color: 'bg-blue-500', label: 'NORMALE' },
    };
    const badge = badges[priorite] || badges.normale;
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Détails de la Commande">
      <div className="space-y-6">
        {/* Header avec ID et Statut */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{commande.id}</h2>
            <p className="text-sm text-gray-500 mt-1">Référence unique</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 ${getStatusColor(commande.statut)}`}>
              {commande.statut}
            </span>
            {getPriorityBadge(commande.priorite)}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
                <p className="text-sm font-semibold text-gray-900">{commande.client}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type Carburant</p>
                <p className="text-sm font-semibold text-gray-900">{commande.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Quantité</p>
                <p className="text-sm font-semibold text-gray-900">{commande.quantity}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date Prévue</p>
                <p className="text-sm font-semibold text-gray-900">{commande.date}</p>
              </div>
            </div>

            {commande.typeCommande && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Type Commande</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{commande.typeCommande}</p>
                </div>
              </div>
            )}

            {commande.referenceCommandeExterne && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Référence Externe</p>
                  <p className="text-sm font-semibold text-gray-900">{commande.referenceCommandeExterne}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            Imprimer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CommandeDetailsModal;
