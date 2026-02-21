import React from 'react';
import { CheckCircle, Circle, Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const ActionCard = ({ action, onToggle, onMoveLeft, onMoveRight }) => {
  const priorityColors = {
    haute: 'border-l-red-500',
    moyenne: 'border-l-orange-500',
    basse: 'border-l-blue-500',
  };

  const statusColors = {
    terminee: 'bg-green-50 border-green-200',
    'en-cours': 'bg-orange-50 border-orange-200',
    'a-faire': 'bg-gray-50 border-gray-200',
  };

  return (
    <div
      className={`border-l-4 ${priorityColors[action.priorite]} ${
        statusColors[action.statut]
      } border rounded-lg p-4 hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(action)}
          className="flex-shrink-0 mt-1"
          type="button"
        >
          {action.statut === 'terminee' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 hover:text-orange-500" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-gray-900 mb-2 ${
              action.statut === 'terminee' ? 'line-through text-gray-500' : ''
            }`}
          >
            {action.titre}
          </h4>

          {action.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {action.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {action.responsable && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{action.responsable}</span>
              </div>
            )}

            {action.dateEcheance && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{action.dateEcheance}</span>
              </div>
            )}

            {action.categorie && (
              <span className="px-2 py-0.5 bg-white border border-gray-200 rounded font-medium">
                {action.categorie}
              </span>
            )}
          </div>
        </div>

        {/* Kanban: déplacer gauche / droite */}
        {(onMoveLeft || onMoveRight) && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onMoveLeft && (
              <button type="button" onClick={() => onMoveLeft(action)} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600" title="Déplacer à gauche">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onMoveRight && (
              <button type="button" onClick={() => onMoveRight(action)} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600" title="Déplacer à droite">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCard;
