import { validate } from 'class-validator';
import { ValidationTresorerieDto } from './validation-tresorerie.dto';

describe('ValidationTresorerieDto', () => {
  it('devrait valider un DTO correct', async () => {
    const dto = new ValidationTresorerieDto();
    dto.paiementRecu = true;
    dto.moyenPaiement = 'virement';
    dto.numeroTransactionVirement = 'TRX-123';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('devrait accepter paiementRecu false', async () => {
    const dto = new ValidationTresorerieDto();
    dto.paiementRecu = false;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('devrait rejeter si paiementRecu manquant', async () => {
    const dto = new ValidationTresorerieDto();
    (dto as any).moyenPaiement = 'virement';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'paiementRecu')).toBe(true);
  });

  it('devrait rejeter si paiementRecu n\'est pas un booléen', async () => {
    const dto = new ValidationTresorerieDto();
    (dto as any).paiementRecu = 'oui';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('devrait accepter champs optionnels vides', async () => {
    const dto = new ValidationTresorerieDto();
    dto.paiementRecu = true;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
