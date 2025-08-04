import type { Currency } from './currencies';
import type { ExpenseCategory } from './expense-categories';
import type { PaginationDto } from './pagination';
import type { PaymentMethod } from './payment-methods';
import type { Tax } from './taxes';

export interface Expense {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  category: ExpenseCategory;
  taxes: Tax[];
  date: string;
  fromExchangeRate: number;
  toExchangeRate: number;
  toCurrency: Currency;
}

export interface ExpenseForm {
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  category: string;
  taxes: string[];
  date: string;
  fromExchangeRate?: string;
  toExchangeRate?: string;
  toCurrency?: string;
}

export interface ExpenseDto {
  description: string;
  amount: number;
  currency: number;
  paymentMethod: string;
  category: string;
  taxes: string[];
  date: string;
  fromExchangeRate?: number | null;
  toExchangeRate?: number | null;
  toCurrency?: number | null;
}

export interface ExpenseFilterDto extends PaginationDto {
  sortBy: keyof Expense;
  sortOrder: 'asc' | 'desc';
  rangeStart: string | null;
  rangeEnd: string | null;
}

export interface RecurringExpense {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  category: ExpenseCategory;
  status: boolean;
  taxes: Tax[];
  recurrenceRule: string;
  nextOccurrence: string | null;
  lastOccurrence: string | null;
}

export interface RecurringExpenseForm {
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  category: string;
  status: boolean;
  taxes: string[];
  recurrenceRule: string;
}

export interface RecurringExpenseDto {
  description: string;
  amount: number;
  currency: number;
  paymentMethod: string;
  category: string;
  taxes: string[];
  status: boolean;
  recurrenceRule: string;
}

export interface RecurringExpenseFilterDto extends PaginationDto {
  sortBy: keyof RecurringExpense;
  sortOrder: 'asc' | 'desc';
}

export interface ExpensesState {
  oneTime: Omit<ExpenseFilterDto, 'page'>;
  recurring: Omit<RecurringExpenseFilterDto, 'page'>;
}

