import type { Currency } from './currencies';

export interface Account {
  uuid: string;
  name: string;
  balance: number;
  currency: Currency;
}

export interface AccountForm {
  name: string;
  balance: string;
  currency: string;
}

export interface AccountDto {
  name: string;
  balance: number;
  currency: number;
}

export interface AccountsState {
  accounts: Account[];
}

