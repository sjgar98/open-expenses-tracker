import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class PostCurrencyDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/)
  code: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

export class PatchCurrencyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
