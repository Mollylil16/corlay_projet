import React from 'react';
import { Check, X, Clock, AlertCircle, User } from 'lucide-react';

const ValidationWorkflow = ({ commande, onValidate, onReject, currentUserRole }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'validee':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'rejetee':
        return <X className="w-5 h-5 text-red-600" />;
      case 'en-attente':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validee':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejetee':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'en-attente':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'validee':
        return 'Validée';
      case 'rejetee':
        return 'Rejetée';
      case 'en-attente':
        return 'En attente de validation';
      default:
        return 'Non soumise';
    }
  };

  const canValidate = () => {
    // Le directeur commercial peut valider les commandes
    return currentUserRole === 'directeur-commercial' || currentUserRole === 'manager-commercial';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow de Validation</h3>

      {/* Timeline */}
      <div className="space-y-4">
        {/* Étape 1 : Création */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Création par Commercial</p>
                <p className="text-sm text-gray-500">
                  {commande.creePar || 'Agent Commercial'} • {commande.dateCreation || 'Aujourd\'hui 09:30'}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Créée</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de connexion */}
        <div className="ml-5 w-0.5 h-8 bg-gray-200"></div>

        {/* Étape 2 : Validation Directeur Commercial */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              commande.statutValidation === 'validee' ? 'bg-green-100' :
              commande.statutValidation === 'rejetee' ? 'bg-red-100' :
              'bg-orange-100'
            }`}>
              {getStatusIcon(commande.statutValidation)}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">Validation Directeur Commercial</p>
                {commande.validePar && (
                  <p className="text-sm text-gray-500">
                    {commande.validePar} • {commande.dateValidation}
                  </p>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${getStatusColor(commande.statutValidation)}`}>
                {getStatusIcon(commande.statutValidation)}
                <span className="text-sm font-medium">{getStatusLabel(commande.statutValidation)}</span>
              </div>
            </div>

            {/* Actions de validation (si en attente et utilisateur autorisé) */}
            {commande.statutValidation === 'en-attente' && canValidate() && (
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => onValidate(commande.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  Valider la Commande
                </button>
                <button
                  onClick={() => onReject(commande.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            )}

            {/* Motif de rejet */}
            {commande.statutValidation === 'rejetee' && commande.motifRejet && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">Motif du rejet :</p>
                <p className="text-sm text-red-700">{commande.motifRejet}</p>
              </div>
            )}
          </div>
        </div>

        {/* Ligne de connexion (si validée) */}
        {commande.statutValidation === 'validee' && (
          <>
            <div className="ml-5 w-0.5 h-8 bg-gray-200"></div>

            {/* Étape 3 : Transmission à la Logistique */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Transmise au Service Logistique</p>
                <p className="text-sm text-gray-500">Prête pour création du Bon de Livraison</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Note d'information */}
      {!canValidate() && commande.statutValidation === 'en-attente' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">En attente de validation</p>
              <p className="text-sm text-blue-700 mt-1">
                Cette commande doit être validée par le Directeur Commercial avant d'être transmise à la logistique.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationWorkflow;
