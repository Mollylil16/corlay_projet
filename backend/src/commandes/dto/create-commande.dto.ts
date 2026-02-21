import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCommandeDto {
  @IsString()
  client: string;

  @IsString()
  type: string;

  @IsInt()
  @Min(1)
  quantite: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  priorite?: string;

  @IsOptional()
  @IsString()
  typeCommande?: string;

  @IsOptional()
  @IsString()
  referenceCommandeExterne?: string;

  @IsOptional()
  @IsString()
  destination?: string; // Ville ou adresse de livraison (ex. Aboisso, Bonoua, Yaou)
}
