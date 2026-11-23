import type { CycleSource } from 'src/utils/credit-cycle.engine';
import { PaymentMethod } from 'src/entities/payment-method.entity';

export interface MonthlySummary {
  date: string;
  Expenses: number;
  Income: number;
  Savings: number;
  SpentSavings: number;
  Unspent: number;
}

export interface StatisticsResponse<T> {
  displayCurrency: string;
  data: T;
}

export interface UpcomingDueDate {
  paymentMethod: PaymentMethod;
  value: number;
  closingDate: Date;
  dueDate: Date;
  closingSource: CycleSource;
  dueSource: CycleSource;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface ExpensesHeatmap {
  [key: string]: number;
}

