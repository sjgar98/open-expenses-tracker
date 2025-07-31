import type { Currency } from './currencies';
import type { PaymentMethod } from './payment-methods';
import type { Tax } from './taxes';

export interface Expense {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  taxes: Tax[];
  date: string;
}

export interface ExpenseForm {
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  taxes: string[];
  date: string;
}

export interface ExpenseDto {
  description: string;
  amount: number;
  currency: number;
  paymentMethod: string;
  taxes: string[];
  date: string;
}

export interface RecurringExpense {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
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
  status: boolean;
  taxes: string[];
  recurrenceRule: string;
}

export interface RecurringExpenseDto {
  description: string;
  amount: number;
  currency: number;
  paymentMethod: string;
  taxes: string[];
  status: boolean;
  recurrenceRule: string;
}

