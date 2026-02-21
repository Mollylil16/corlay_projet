import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ValidationTresorerieDto {
  @IsBoolean()
  paiementRecu: boolean;

  @IsOptional()
  @IsString()
  moyenPaiement?: string; // cheque, virement, especes, autre

  @IsOptional()
  @IsString()
  numeroCheque?: string;

  @IsOptional()
  @IsString()
  numeroTransactionVirement?: string;
}
