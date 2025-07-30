import { IsNumber, IsString, Max, Min, MinLength } from 'class-validator';

export class TaxDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @Min(0.01)
  @Max(100)
  rate: number;
}

