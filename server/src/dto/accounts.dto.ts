import { IsHexColor, IsNumber, IsString, Min } from 'class-validator';

export class AccountDto {
  @IsString({ message: 'accounts.errors.accountNameRequired' })
  name: string;

  @IsNumber(undefined, { message: 'accounts.errors.accountBalanceInvalid' })
  @Min(0, { message: 'accounts.errors.accountBalanceInvalid' })
  balance: number;

  @IsString()
  icon: string;

  @IsHexColor()
  iconColor: string;

  @IsNumber(undefined, { message: 'accounts.errors.accountCurrencyRequired' })
  @Min(1, { message: 'accounts.errors.accountCurrencyRequired' })
  currency: number;
}

