/** Couleurs courantes pour les camions (sélecteur type Canva) */
export const COULEURS_CAMION = [
  { id: 'blanc', label: 'Blanc', hex: '#FFFFFF' },
  { id: 'noir', label: 'Noir', hex: '#1a1a1a' },
  { id: 'gris', label: 'Gris', hex: '#6b7280' },
  { id: 'gris-clair', label: 'Gris clair', hex: '#9ca3af' },
  { id: 'bleu', label: 'Bleu', hex: '#2563eb' },
  { id: 'bleu-clair', label: 'Bleu clair', hex: '#60a5fa' },
  { id: 'rouge', label: 'Rouge', hex: '#dc2626' },
  { id: 'vert', label: 'Vert', hex: '#16a34a' },
  { id: 'jaune', label: 'Jaune', hex: '#eab308' },
  { id: 'orange', label: 'Orange', hex: '#ea580c' },
  { id: 'marron', label: 'Marron', hex: '#78350f' },
  { id: 'violet', label: 'Violet', hex: '#7c3aed' },
];

/** Retourne le hex pour afficher un camion (à partir du label ou du hex enregistré) */
export function getCamionColorHex(couleur) {
  if (!couleur) return null;
  if (couleur.startsWith('#')) return couleur;
  const found = COULEURS_CAMION.find((c) => c.label.toLowerCase() === couleur.toLowerCase());
  return found ? found.hex : null;
}
