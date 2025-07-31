import type { Account } from './accounts';

export interface PaymentMethod {
  uuid: string;
  name: string;
  icon: string;
  iconColor: string;
  account: Account;
  credit: boolean;
  creditClosingDateRule?: string | null;
  creditDueDateRule?: string | null;
  nextClosingOccurrence: Date | null;
  nextDueOccurrence: Date | null;
}

export interface PaymentMethodDto {
  name: string;
  icon: string;
  iconColor: string;
  account: string;
  credit: boolean;
  creditClosingDateRule?: string;
  creditDueDateRule?: string;
}

