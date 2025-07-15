import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PostAccountDto {
  @IsString()
  name: string;

  @IsNumber()
  balance: number;

  @IsNumber()
  currencyId: number;
}

export class PatchAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  balance?: number;

  @IsNumber()
  @IsOptional()
  currencyId?: number;
}
