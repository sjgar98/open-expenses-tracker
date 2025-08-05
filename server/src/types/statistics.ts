import { PaymentMethod } from 'src/entities/payment-method.entity';

export interface MonthlySummary {
  date: string;
  Expenses: number;
  Income: number;
}

export interface UpcomingDueDate {
  paymentMethod: PaymentMethod;
  value: number;
  closingDate: Date;
  dueDate: Date;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

