import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCommandeDto {
  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantite?: number;

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
}
