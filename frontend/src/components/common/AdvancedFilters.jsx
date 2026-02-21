import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

/**
 * Composant de filtres avancés réutilisable
 * 
 * @param {Object} filters - État des filtres actuels
 * @param {Function} onFilterChange - Callback appelé quand un filtre change
 * @param {Function} onReset - Callback pour réinitialiser les filtres
 * @param {Array} filterConfig - Configuration des filtres à afficher
 */
const AdvancedFilters = ({ filters, onFilterChange, onReset, filterConfig = [] }) => {
  
  const handleInputChange = (filterKey, value) => {
    onFilterChange({ ...filters, [filterKey]: value });
  };

  const handleReset = () => {
    const resetFilters = {};
    filterConfig.forEach(config => {
      resetFilters[config.key] = config.type === 'search' ? '' : (config.defaultValue || 'tous');
    });
    onReset ? onReset(resetFilters) : onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {filterConfig.map((config) => {
          if (config.type === 'search') {
            return (
              <div key={config.key} className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={config.placeholder || 'Rechercher...'}
                    value={filters[config.key] || ''}
                    onChange={(e) => handleInputChange(config.key, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            );
          }

          if (config.type === 'select') {
            return (
              <div key={config.key}>
                <select
                  value={filters[config.key] || config.defaultValue || 'tous'}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (config.type === 'date') {
            return (
              <div key={config.key}>
                <input
                  type="date"
                  value={filters[config.key] || ''}
                  onChange={(e) => handleInputChange(config.key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            );
          }

          return null;
        })}

        {/* Bouton Reset */}
        <div>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
