import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAlerteDto {
  @IsString()
  type: string;

  @IsString()
  severite: string;

  @IsString()
  titre: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  vehicule?: string;

  @IsOptional()
  @IsString()
  depot?: string;

  @IsOptional()
  @IsBoolean()
  lu?: boolean;
}
