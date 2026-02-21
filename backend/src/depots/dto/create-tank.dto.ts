import { IsInt, IsString, Min } from 'class-validator';

export class CreateTankDto {
  @IsString()
  tankNumber: string;

  @IsString()
  name: string;

  @IsString()
  type: string; // diesel, essence

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(0)
  percentage?: number;
}
