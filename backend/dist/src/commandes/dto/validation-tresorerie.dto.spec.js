"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const validation_tresorerie_dto_1 = require("./validation-tresorerie.dto");
describe('ValidationTresorerieDto', () => {
    it('devrait valider un DTO correct', async () => {
        const dto = new validation_tresorerie_dto_1.ValidationTresorerieDto();
        dto.paiementRecu = true;
        dto.moyenPaiement = 'virement';
        dto.numeroTransactionVirement = 'TRX-123';
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
    it('devrait accepter paiementRecu false', async () => {
        const dto = new validation_tresorerie_dto_1.ValidationTresorerieDto();
        dto.paiementRecu = false;
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
    it('devrait rejeter si paiementRecu manquant', async () => {
        const dto = new validation_tresorerie_dto_1.ValidationTresorerieDto();
        dto.moyenPaiement = 'virement';
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'paiementRecu')).toBe(true);
    });
    it('devrait rejeter si paiementRecu n\'est pas un booléen', async () => {
        const dto = new validation_tresorerie_dto_1.ValidationTresorerieDto();
        dto.paiementRecu = 'oui';
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('devrait accepter champs optionnels vides', async () => {
        const dto = new validation_tresorerie_dto_1.ValidationTresorerieDto();
        dto.paiementRecu = true;
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
});
//# sourceMappingURL=validation-tresorerie.dto.spec.js.map