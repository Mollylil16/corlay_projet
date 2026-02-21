"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const validation_facturation_dto_1 = require("./validation-facturation.dto");
describe('ValidationFacturationDto', () => {
    it('devrait valider un DTO correct', async () => {
        const dto = new validation_facturation_dto_1.ValidationFacturationDto();
        dto.numeroBonCommandeInterne = 'BC-INT-2024-001';
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
    it('devrait rejeter si numeroBonCommandeInterne manquant', async () => {
        const dto = new validation_facturation_dto_1.ValidationFacturationDto();
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.property === 'numeroBonCommandeInterne')).toBe(true);
    });
    it('devrait rejeter si numeroBonCommandeInterne n\'est pas une chaîne', async () => {
        const dto = new validation_facturation_dto_1.ValidationFacturationDto();
        dto.numeroBonCommandeInterne = 12345;
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('devrait accepter une chaîne vide (trim sera fait côté service)', async () => {
        const dto = new validation_facturation_dto_1.ValidationFacturationDto();
        dto.numeroBonCommandeInterne = '';
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
});
//# sourceMappingURL=validation-facturation.dto.spec.js.map