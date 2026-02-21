import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const NewCommandeForm = ({ onClose, onSave, clients: clientsProp }) => {
  const [formData, setFormData] = useState({
    typeCommande: 'externe', // externe ou interne
    referenceCommandeExterne: '', // Si commande interne, référence de la commande externe
    client: '',
    newClient: false,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    typeCarburant: '',
    quantity: '',
    unit: 'litres',
    addresseLivraison: '',
    gpsCoordinates: '',
    dateLivraison: '',
    heureLivraison: '',
    priorite: 'normale',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const carburantTypes = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'essence', label: 'Essence' },
    { value: 'jet-a1', label: 'Jet A-1 (Aviation)' },
    { value: 'kerosene', label: 'Kérosène' },
    { value: 'fuel-maritime', label: 'Fuel Maritime' },
  ];

  const clients = Array.isArray(clientsProp) ? clientsProp : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newClient && !formData.client) {
      newErrors.client = 'Veuillez sélectionner un client';
    }

    if (formData.newClient) {
      if (!formData.clientName) newErrors.clientName = 'Nom du client requis';
      if (!formData.clientPhone) newErrors.clientPhone = 'Téléphone requis';
    }

    if (!formData.typeCarburant) {
      newErrors.typeCarburant = 'Type de carburant requis';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantité invalide';
    }

    if (!formData.addresseLivraison) {
      newErrors.addresseLivraison = 'Adresse de livraison requise';
    }

    if (!formData.dateLivraison) {
      newErrors.dateLivraison = 'Date de livraison requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type de Commande */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Type de Commande</h4>
        
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="typeCommande"
              value="externe"
              checked={formData.typeCommande === 'externe'}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Commande Externe (Client hors Corlay)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="typeCommande"
              value="interne"
              checked={formData.typeCommande === 'interne'}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Commande Interne (Station Corlay)</span>
          </label>
        </div>

        {/* Si commande interne, demander la référence externe */}
        {formData.typeCommande === 'interne' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence Commande Externe <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="referenceCommandeExterne"
              value={formData.referenceCommandeExterne}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: CMD-EXT-2024-001"
            />
            <p className="text-xs text-gray-600 mt-2">
              Numéro du bon de commande externe reçu du client
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Client Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations Client</h4>
        
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="newClient"
              checked={formData.newClient}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Nouveau client</span>
          </label>
        </div>

        {!formData.newClient ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client existant <span className="text-red-500">*</span>
            </label>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${
                errors.client ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Sélectionner un client...</option>
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
            {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.clientName ? 'border-red-300' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                placeholder="Ex: Station Shell Plateau"
              />
              {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.clientPhone ? 'border-red-300' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                placeholder="+225 XX XX XX XX XX"
              />
              {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optionnel)
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="contact@client.com"
              />
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Product Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Détails de la Commande</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de Carburant <span className="text-red-500">*</span>
            </label>
            <select
              name="typeCarburant"
              value={formData.typeCarburant}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border ${
                errors.typeCarburant ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
            >
              <option value="">Sélectionner un type...</option>
              {carburantTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.typeCarburant && <p className="text-red-500 text-xs mt-1">{errors.typeCarburant}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`flex-1 px-4 py-2.5 border ${
                  errors.quantity ? 'border-red-300' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                placeholder="Ex: 15000"
                min="0"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="litres">Litres</option>
                <option value="m3">m³</option>
              </select>
            </div>
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Delivery Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Informations de Livraison</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse de Livraison <span className="text-red-500">*</span>
            </label>
            <textarea
              name="addresseLivraison"
              value={formData.addresseLivraison}
              onChange={handleChange}
              rows="2"
              className={`w-full px-4 py-2.5 border ${
                errors.addresseLivraison ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              placeholder="Adresse complète de livraison..."
            />
            {errors.addresseLivraison && <p className="text-red-500 text-xs mt-1">{errors.addresseLivraison}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordonnées GPS (optionnel)
            </label>
            <input
              type="text"
              name="gpsCoordinates"
              value={formData.gpsCoordinates}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: 5.3599, -4.0083"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Livraison <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateLivraison"
                value={formData.dateLivraison}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.dateLivraison ? 'border-red-300' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {errors.dateLivraison && <p className="text-red-500 text-xs mt-1">{errors.dateLivraison}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de Livraison (optionnel)
              </label>
              <input
                type="time"
                name="heureLivraison"
                value={formData.heureLivraison}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              name="priorite"
              value={formData.priorite}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="normale">Normale</option>
              <option value="urgent">Urgent</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes / Instructions spéciales (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Instructions particulières pour la livraison..."
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          Créer la Commande
        </button>
      </div>
    </form>
  );
};

export default NewCommandeForm;
