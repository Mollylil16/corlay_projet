import { validate } from 'class-validator';
import { ValidationFacturationDto } from './validation-facturation.dto';

describe('ValidationFacturationDto', () => {
  it('devrait valider un DTO correct', async () => {
    const dto = new ValidationFacturationDto();
    dto.numeroBonCommandeInterne = 'BC-INT-2024-001';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('devrait rejeter si numeroBonCommandeInterne manquant', async () => {
    const dto = new ValidationFacturationDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'numeroBonCommandeInterne')).toBe(true);
  });

  it('devrait rejeter si numeroBonCommandeInterne n\'est pas une chaîne', async () => {
    const dto = new ValidationFacturationDto();
    (dto as any).numeroBonCommandeInterne = 12345;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('devrait accepter une chaîne vide (trim sera fait côté service)', async () => {
    const dto = new ValidationFacturationDto();
    dto.numeroBonCommandeInterne = '';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
