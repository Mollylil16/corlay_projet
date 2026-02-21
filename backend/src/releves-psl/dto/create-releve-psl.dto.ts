import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReleveStockPSLDto {
  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  typeCarburant: string; // diesel, essence, etc.

  @IsInt()
  @Min(0)
  quantiteDeclareePSL: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
