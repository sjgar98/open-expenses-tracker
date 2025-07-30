import type { DateTime } from 'luxon';
import type { Account } from './accounts';
import type { Currency } from './currencies';

export interface Income {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  account: Account;
  recurringIncome: RecurringIncome | null;
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
}

export interface IncomeForm {
  description: string;
  amount: string;
  currency: string;
  account: string;
  date: DateTime;
}

export interface IncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  date: string;
}

export interface RecurringIncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  status: boolean;
  startDate: string;
  recurrenceRule: string;
}

