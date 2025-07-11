import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostCurrencyDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  symbol: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class PatchCurrencyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  symbol?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
