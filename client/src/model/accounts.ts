import type { Currency } from './currencies';

export interface Account {
  uuid: string;
  name: string;
  balance: number;
  currency: Currency;
  icon: string;
  iconColor: string;
}

export interface AccountForm {
  name: string;
  balance: string;
  currency: string;
  icon: string;
  iconColor: string;
}

export interface AccountDto {
  name: string;
  balance: number;
  currency: number;
  icon: string;
  iconColor: string;
}

