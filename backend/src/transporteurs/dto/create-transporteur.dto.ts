import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateTransporteurDto {
  @IsString()
  nom: string; // Raison sociale / nom de la compagnie

  @IsString()
  telephone: string;

  @IsOptional()
  @IsString()
  nomContact?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  couleur?: string; // orange, blue, green, purple, red, teal, indigo, amber
}
