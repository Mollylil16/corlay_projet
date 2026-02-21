import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class CreateTourneeDto {
  @IsString()
  @IsNotEmpty()
  camionId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Sélectionnez au moins une commande' })
  @IsString({ each: true })
  commandeIds: string[];
}
