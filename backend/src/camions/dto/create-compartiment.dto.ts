import { IsInt, Min } from 'class-validator';

export class CreateCompartimentDto {
  @IsInt()
  @Min(1)
  ordre: number;

  @IsInt()
  @Min(1)
  capaciteLitres: number;
}
