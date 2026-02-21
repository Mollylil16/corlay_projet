import { IsString } from 'class-validator';

export class ValidationFacturationDto {
  @IsString()
  numeroBonCommandeInterne: string;
}
