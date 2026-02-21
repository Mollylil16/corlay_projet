/**
 * Tests de validation du workflow et des statuts (logique métier).
 */

import { describe, it, expect } from 'vitest';

const STATUTS = {
  EN_ATTENTE_TRESORERIE: 'en_attente_tresorerie',
  VALIDE_TRESORERIE: 'valide_tresorerie',
  VALIDEE: 'validee',
  EN_TRANSIT: 'en-transit',
  LIVREE: 'livree',
  ANNULEE: 'annulee',
};

/** Statuts dans l'ordre du workflow Trésorerie → Facturation → Logistique */
const WORKFLOW_ORDER = [
  STATUTS.EN_ATTENTE_TRESORERIE,
  STATUTS.VALIDE_TRESORERIE,
  STATUTS.VALIDEE,
  STATUTS.EN_TRANSIT,
  STATUTS.LIVREE,
];

function canValidateTresorerie(statut) {
  return statut === STATUTS.EN_ATTENTE_TRESORERIE;
}

function canValidateFacturation(statut) {
  return statut === STATUTS.VALIDE_TRESORERIE;
}

function canCreateBL(statut) {
  return statut === STATUTS.VALIDEE;
}

function indexInWorkflow(statut) {
  const i = WORKFLOW_ORDER.indexOf(statut);
  return i === -1 ? null : i;
}

describe('Validation workflow commandes', () => {
  describe('canValidateTresorerie', () => {
    it('retourne true uniquement pour en_attente_tresorerie', () => {
      expect(canValidateTresorerie(STATUTS.EN_ATTENTE_TRESORERIE)).toBe(true);
      expect(canValidateTresorerie(STATUTS.VALIDE_TRESORERIE)).toBe(false);
      expect(canValidateTresorerie(STATUTS.VALIDEE)).toBe(false);
    });
  });

  describe('canValidateFacturation', () => {
    it('retourne true uniquement pour valide_tresorerie', () => {
      expect(canValidateFacturation(STATUTS.VALIDE_TRESORERIE)).toBe(true);
      expect(canValidateFacturation(STATUTS.EN_ATTENTE_TRESORERIE)).toBe(false);
      expect(canValidateFacturation(STATUTS.VALIDEE)).toBe(false);
    });
  });

  describe('canCreateBL', () => {
    it('retourne true uniquement pour validee', () => {
      expect(canCreateBL(STATUTS.VALIDEE)).toBe(true);
      expect(canCreateBL(STATUTS.VALIDE_TRESORERIE)).toBe(false);
      expect(canCreateBL(STATUTS.EN_TRANSIT)).toBe(false);
    });
  });

  describe('ordre du workflow', () => {
    it('en_attente_tresorerie est avant valide_tresorerie', () => {
      expect(indexInWorkflow(STATUTS.EN_ATTENTE_TRESORERIE)).toBeLessThan(
        indexInWorkflow(STATUTS.VALIDE_TRESORERIE)
      );
    });
    it('valide_tresorerie est avant validee', () => {
      expect(indexInWorkflow(STATUTS.VALIDE_TRESORERIE)).toBeLessThan(
        indexInWorkflow(STATUTS.VALIDEE)
      );
    });
    it('validee est avant en-transit et livree', () => {
      expect(indexInWorkflow(STATUTS.VALIDEE)).toBeLessThan(
        indexInWorkflow(STATUTS.EN_TRANSIT)
      );
      expect(indexInWorkflow(STATUTS.EN_TRANSIT)).toBeLessThan(
        indexInWorkflow(STATUTS.LIVREE)
      );
    });
    it('annulee n\'est pas dans le workflow ordonné', () => {
      expect(indexInWorkflow(STATUTS.ANNULEE)).toBeNull();
    });
  });
});
