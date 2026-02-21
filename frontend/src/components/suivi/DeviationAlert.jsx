import React from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';

const DeviationAlert = ({ alert, onIgnore, onContact }) => {
  if (!alert) return null;

  return (
    <div className="bg-white border-t-4 border-red-500 rounded-t-xl shadow-2xl p-4">
      <div className="flex items-start gap-4">
        {/* Alert Icon */}
        <div className="flex-shrink-0">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        {/* Alert Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">
              Alerte de Déviation : {alert.vehicleId}
            </h4>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase">
              {alert.severity}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {alert.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onIgnore}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            IGNORER
          </button>
          <button
            onClick={onContact}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            <Phone className="w-4 h-4" />
            CONTACTER LE CHAUFFEUR
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onIgnore}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default DeviationAlert;
