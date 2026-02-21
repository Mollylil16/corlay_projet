import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBonLivraisonDto {
  @IsString()
  numeroCommande: string;

  @IsString()
  client: string;

  @IsString()
  chauffeur: string;

  @IsString()
  vehicule: string;

  @IsString()
  typeCarburant: string;

  @IsInt()
  @Min(1)
  quantiteCommandee: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantiteLivree?: number;

  @IsOptional()
  @IsString()
  dateEmission?: string;

  @IsOptional()
  @IsString()
  heureDepart?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsBoolean()
  signature?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;
}
