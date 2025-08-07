import type { Account } from './accounts';
import type { Currency } from './currencies';
import type { IncomeSource } from './income-source';
import type { PaginationDto } from './pagination';

export interface Income {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  account: Account;
  source: IncomeSource;
  date: string;
}

export interface RecurringIncome {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  account: Account;
  source: IncomeSource;
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
  source: string;
  date: string;
}

export interface IncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  source: string;
  date: string;
}

export interface IncomeFilterDto extends PaginationDto {
  sortBy: keyof Income;
  sortOrder: 'asc' | 'desc';
  rangeStart: string | null;
  rangeEnd: string | null;
}

export interface RecurringIncomeForm {
  description: string;
  amount: string;
  currency: string;
  account: string;
  source: string;
  status: boolean;
  recurrenceRule: string;
}

export interface RecurringIncomeDto {
  description: string;
  amount: number;
  currency: number;
  account: string;
  source: string;
  status: boolean;
  recurrenceRule: string;
}

export interface RecurringIncomeFilterDto extends PaginationDto {
  sortBy: keyof RecurringIncome;
  sortOrder: 'asc' | 'desc';
}

export interface IncomeState {
  oneTime: Omit<IncomeFilterDto, 'page'>;
  recurring: Omit<RecurringIncomeFilterDto, 'page'>;
}

