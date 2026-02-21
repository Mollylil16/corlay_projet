import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTourneeDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format date attendu: YYYY-MM-DD' })
  dateDepartPrevue?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,2}:\d{2}$/, { message: 'Format heure attendu: H:mm ou HH:mm' })
  heureDepartPrevue?: string;
}
