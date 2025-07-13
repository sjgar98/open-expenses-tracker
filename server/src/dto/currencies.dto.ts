import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostCurrencyDto {
  @IsString()
  name: string;

  @IsString()
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
