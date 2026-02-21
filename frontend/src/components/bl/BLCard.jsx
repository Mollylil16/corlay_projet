import React from 'react';
import { FileText, Truck, Calendar, Package, Clock, Check, X, AlertCircle } from 'lucide-react';

const BLCard = ({ bl, onValidate, onReject, onView, currentUserRole }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'valide':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejete':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'en-attente-validation':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'en-cours-chargement':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'termine':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'valide':
        return 'Validé';
      case 'rejete':
        return 'Rejeté';
      case 'en-attente-validation':
        return 'En attente de validation';
      case 'en-cours-chargement':
        return 'En cours de chargement';
      case 'termine':
        return 'Terminé';
      default:
        return status;
    }
  };

  const canValidate = () => {
    return currentUserRole === 'chef-service-logistique' || currentUserRole === 'manager-logistique';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{bl.numeroBL}</h4>
            <p className="text-xs text-gray-500">Commande: {bl.numeroCommande}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(bl.statut)}`}>
          {getStatusLabel(bl.statut)}
        </span>
      </div>

      {/* Référence Commande Externe */}
      {bl.referenceCommandeExterne && (
        <div className="mb-3 p-2 bg-blue-50 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700">
            Réf. Externe: <span className="font-medium">{bl.referenceCommandeExterne}</span>
          </span>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Truck className="w-4 h-4" />
          <span>{bl.transporteur} • {bl.immatriculation}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Package className="w-4 h-4" />
          <span>{bl.produit} • {bl.volume}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Chargement: {bl.dateChargement}</span>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Créé par: {bl.creePar}</span>
          <span>{bl.dateCreation}</span>
        </div>
        {bl.validePar && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Validé par: {bl.validePar}</span>
            <span>{bl.dateValidation}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        {bl.statut === 'en-attente-validation' && canValidate() ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onValidate(bl.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              <Check className="w-4 h-4" />
              Valider
            </button>
            <button
              onClick={() => onReject(bl.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Rejeter
            </button>
          </div>
        ) : (
          <button
            onClick={() => onView(bl)}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
          >
            Voir Détails
          </button>
        )}
      </div>

      {/* Warning si en attente */}
      {bl.statut === 'en-attente-validation' && !canValidate() && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
            <p className="text-xs text-orange-700">
              En attente de validation par le Chef de Service Logistique
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BLCard;
