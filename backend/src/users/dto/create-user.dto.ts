import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  telephone?: string;
}
