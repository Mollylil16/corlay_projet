import React, { useState } from 'react';
import { FileText, Truck, Calendar, Package, AlertCircle } from 'lucide-react';

const CreateBLForm = ({ commande, onSubmit, onCancel, camions: camionsProp = [], depots: depotsProp = [] }) => {
  const camions = Array.isArray(camionsProp) ? camionsProp : [];
  const depots = depotsProp.length > 0
    ? depotsProp.map((d) => ({ id: d.id, nom: d.nom }))
    : [];

  const [blData, setBlData] = useState({
    numeroCommande: commande?.id || '',
    referenceCommandeExterne: commande?.referenceCommandeExterne || '',
    transporteur: '',
    chauffeur: '',
    immatriculation: '',
    dateChargementPrevue: '',
    heureChargementPrevue: '',
    volumeACharger: commande?.quantiteRaw ?? commande?.quantite ?? '',
    depot: '',
    observations: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlData({ ...blData, [name]: value });

    // Auto-remplir chauffeur et immatriculation si camion sélectionné
    if (name === 'transporteur') {
      const camion = camions.find((c) => c.id === value);
      if (camion) {
        setBlData({
          ...blData,
          transporteur: value,
          chauffeur: camion.chauffeur,
          immatriculation: camion.immatriculation,
        });
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!blData.transporteur) newErrors.transporteur = 'Camion requis';
    if (!blData.depot) newErrors.depot = 'Dépôt requis';
    if (!blData.dateChargementPrevue) newErrors.dateChargementPrevue = 'Date requise';
    if (!blData.heureChargementPrevue) newErrors.heureChargementPrevue = 'Heure requise';
    if (!blData.volumeACharger || blData.volumeACharger <= 0) {
      newErrors.volumeACharger = 'Volume invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(blData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Information Commande */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Informations de la Commande
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Numéro Commande:</span>
            <span className="ml-2 font-medium text-gray-900">{commande?.id}</span>
          </div>
          {commande?.typeCommande === 'interne' && commande?.referenceCommandeExterne && (
            <div>
              <span className="text-gray-600">Réf. Commande Externe:</span>
              <span className="ml-2 font-medium text-gray-900">{commande.referenceCommandeExterne}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Client:</span>
            <span className="ml-2 font-medium text-gray-900">{commande?.client}</span>
          </div>
          <div>
            <span className="text-gray-600">Produit:</span>
            <span className="ml-2 font-medium text-gray-900">{commande?.produit}</span>
          </div>
        </div>
      </div>

      {/* Sélection Dépôt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dépôt de Chargement <span className="text-red-500">*</span>
        </label>
        <select
          name="depot"
          value={blData.depot}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border ${
            errors.depot ? 'border-red-300' : 'border-gray-200'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
        >
          <option value="">Sélectionner un dépôt...</option>
          {depots.map((depot) => (
            <option key={depot.id} value={depot.id}>
              {depot.nom}
            </option>
          ))}
        </select>
        {errors.depot && <p className="text-red-500 text-xs mt-1">{errors.depot}</p>}
      </div>

      {/* Sélection Camion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Camion assigné <span className="text-red-500">*</span>
        </label>
        <select
          name="transporteur"
          value={blData.transporteur}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border ${
            errors.transporteur ? 'border-red-300' : 'border-gray-200'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
        >
          <option value="">Sélectionner un camion...</option>
          {camions.map((camion) => (
            <option key={camion.id} value={camion.id}>
              {camion.immatriculation} — {camion.chauffeur !== '—' ? camion.chauffeur : camion.compagnie}
            </option>
          ))}
        </select>
        {errors.transporteur && <p className="text-red-500 text-xs mt-1">{errors.transporteur}</p>}
      </div>

      {/* Chauffeur et Immatriculation (auto-remplis) */}
      {blData.chauffeur && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chauffeur</label>
            <input
              type="text"
              value={blData.chauffeur}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Immatriculation</label>
            <input
              type="text"
              value={blData.immatriculation}
              readOnly
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
            />
          </div>
        </div>
      )}

      {/* Date et Heure de Chargement */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Planification du Chargement</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de Chargement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateChargementPrevue"
              value={blData.dateChargementPrevue}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${
                errors.dateChargementPrevue ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.dateChargementPrevue && (
              <p className="text-red-500 text-xs mt-1">{errors.dateChargementPrevue}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de Chargement <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="heureChargementPrevue"
              value={blData.heureChargementPrevue}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${
                errors.heureChargementPrevue ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            {errors.heureChargementPrevue && (
              <p className="text-red-500 text-xs mt-1">{errors.heureChargementPrevue}</p>
            )}
          </div>
        </div>
      </div>

      {/* Volume à Charger */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Volume à Charger <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            name="volumeACharger"
            value={blData.volumeACharger}
            onChange={handleChange}
            className={`flex-1 px-4 py-2.5 border ${
              errors.volumeACharger ? 'border-red-300' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
            placeholder="Ex: 15000"
            min="0"
          />
          <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">
            Litres
          </div>
        </div>
        {errors.volumeACharger && <p className="text-red-500 text-xs mt-1">{errors.volumeACharger}</p>}
      </div>

      {/* Observations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observations (optionnel)
        </label>
        <textarea
          name="observations"
          value={blData.observations}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Instructions particulières pour le chargement..."
        />
      </div>

      {/* Note de workflow */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-900">Validation requise</p>
            <p className="text-sm text-orange-700 mt-1">
              Ce Bon de Livraison devra être validé par le Chef de Service Logistique avant transmission au transporteur.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
        >
          <FileText className="w-4 h-4" />
          Créer le Bon de Livraison
        </button>
      </div>
    </form>
  );
};

export default CreateBLForm;
