import type { Currency } from './currencies';
import type { PaymentMethod } from './payment-methods';

export interface Expense {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod | null;
  // recurringExpense: RecurringExpense | null;
  // taxes: Tax[];
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

