import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CurrencyDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/)
  code: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}
