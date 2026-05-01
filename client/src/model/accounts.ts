import type { Currency } from './currencies';

export interface Account {
  uuid: string;
  name: string;
  currency: Currency;
  icon: string;
  iconColor: string;
  isDeleted: boolean;
}

export interface AccountForm {
  name: string;
  currency: string;
  icon: string;
  iconColor: string;
}

export interface AccountDto {
  name: string;
  currency: number;
  icon: string;
  iconColor: string;
}

