import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCommandeAchatDto {
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsString()
  typeCarburant: string;

  @IsInt()
  @Min(0)
  quantiteCommandee: number;

  @IsInt()
  @Min(0)
  quantiteRecue: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
