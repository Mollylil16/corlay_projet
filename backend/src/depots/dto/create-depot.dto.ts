import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTankDto } from './create-tank.dto';

export class CreateDepotDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  statut?: string; // operationnel, niveau-bas

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTankDto)
  tanks?: CreateTankDto[];
}
