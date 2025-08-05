import type { PaymentMethod } from './payment-methods';

export interface DraggableWidgetProps {
  height?: number;
  width?: number;
  id: string;
  index: number;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
  widget: React.ReactNode;
}

export interface WidgetProps {
  height?: number;
  width?: number;
}

export interface DragItem {
  index: number;
  id: string;
  type: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlySummary {
  date: string;
  Expenses: number;
  Income: number;
}

export interface UpcomingDueDate {
  paymentMethod: PaymentMethod;
  value: number;
  closingDate: string;
  dueDate: string;
}

