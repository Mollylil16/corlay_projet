import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateTransporteurDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

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
  couleur?: string;
}
