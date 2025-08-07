import { IsISO4217CurrencyCode } from 'class-validator';

export class UserSettingsDto {
  @IsISO4217CurrencyCode()
  displayCurrency: string;
}

