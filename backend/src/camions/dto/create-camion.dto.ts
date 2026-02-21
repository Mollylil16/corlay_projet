import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCompartimentDto } from './create-compartiment.dto';

export class CreateCamionDto {
  @IsString()
  transporteurId: string;

  @IsString()
  immatriculation: string;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsString()
  statut?: string; // disponible, en-mission, maintenance

  @IsOptional()
  @IsString()
  chauffeur?: string;

  @IsOptional()
  @IsString()
  telephoneChauffeur?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompartimentDto)
  compartiments: CreateCompartimentDto[]; // Au moins 1 compartiment avec ordre + capaciteLitres
}
