import type { Account } from './accounts';
import type { Currency } from './currencies';

export interface Income {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  account: Account;
  date: string;
}

export interface RecurringIncome {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  account: Account;
  status: boolean;
  startDate: string;
  recurrenceRule: string;
  nextOccurrence: string | null;
  lastOccurrence: string | null;
}

export interface IncomeForm {
  description: string;
  amount: string;
  currency: string;
  account: string;
  date: string;
}

export interface IncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  date: string;
}

export interface RecurringIncomeForm {
  description: string;
  amount: string;
  currency: string;
  account: string;
  status: boolean;
  recurrenceRule: string;
}

export interface RecurringIncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  status: boolean;
  recurrenceRule: string;
}

