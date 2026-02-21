import React from 'react';
import { Building2, Phone, Truck, Eye } from 'lucide-react';
import { getCouleurTransporteur } from '../../constants/couleursTransporteur';
import { getCamionColorHex } from '../../constants/couleursCamion';

const TransporteurCard = ({ transporteur, onViewDetails }) => {
  const nbCamions = (transporteur.camions || []).length;
  const nbDisponibles = (transporteur.camions || []).filter((c) => c.statut === 'disponible').length;
  const couleur = getCouleurTransporteur(transporteur.couleur);
  const premierCamion = (transporteur.camions || [])[0];
  const camionColorHex = premierCamion ? getCamionColorHex(premierCamion.couleur) : null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-gradient-to-br ${couleur.bg} rounded-lg`}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{transporteur.nom}</h3>
            <p className="text-sm text-gray-500">{transporteur.nomContact || '—'}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{transporteur.telephone}</span>
        </div>
        {transporteur.adresse && (
          <p className="text-sm text-gray-600 mb-2 truncate" title={transporteur.adresse}>{transporteur.adresse}</p>
        )}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Truck className="w-4 h-4 shrink-0" style={camionColorHex ? { color: camionColorHex } : { color: '#9ca3af' }} />
          <span className="text-sm font-medium text-gray-700">{nbCamions} camion{nbCamions !== 1 ? 's' : ''}</span>
          {nbCamions > 0 && (
            <span className="text-xs text-green-600">({nbDisponibles} disponible{nbDisponibles !== 1 ? 's' : ''})</span>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t">
        <button
          onClick={() => onViewDetails(transporteur)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 ${couleur.btn} text-white rounded-lg font-medium text-sm transition-colors`}
        >
          <Eye className="w-4 h-4" />
          Voir le profil et la flotte
        </button>
      </div>
    </div>
  );
};

export default TransporteurCard;
