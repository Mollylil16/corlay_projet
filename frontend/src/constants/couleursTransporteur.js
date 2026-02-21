/** Couleurs disponibles pour les cartes transporteurs (compagnies) */
export const COULEURS_TRANSPORTEUR = [
  { id: 'orange', label: 'Orange', bg: 'from-orange-400 to-orange-600', btn: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'blue', label: 'Bleu', bg: 'from-blue-400 to-blue-600', btn: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'green', label: 'Vert', bg: 'from-green-400 to-green-600', btn: 'bg-green-500 hover:bg-green-600' },
  { id: 'purple', label: 'Violet', bg: 'from-purple-400 to-purple-600', btn: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'red', label: 'Rouge', bg: 'from-red-400 to-red-600', btn: 'bg-red-500 hover:bg-red-600' },
  { id: 'teal', label: 'Teal', bg: 'from-teal-400 to-teal-600', btn: 'bg-teal-500 hover:bg-teal-600' },
  { id: 'indigo', label: 'Indigo', bg: 'from-indigo-400 to-indigo-600', btn: 'bg-indigo-500 hover:bg-indigo-600' },
  { id: 'amber', label: 'Ambre', bg: 'from-amber-400 to-amber-600', btn: 'bg-amber-500 hover:bg-amber-600' },
];

export const getCouleurTransporteur = (couleurId) => {
  const found = COULEURS_TRANSPORTEUR.find((c) => c.id === (couleurId || 'orange'));
  return found || COULEURS_TRANSPORTEUR[0];
};
