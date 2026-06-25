import type { Currency } from './currencies';

export interface SavingsBucket {
  uuid: string;
  name: string;
  icon: string;
  iconColor: string;
  isDeleted: boolean;
  targetAmount: number | null;
  currency: Currency;
  deadline: string | null;
}

export interface SavingsBucketWithCurrent extends SavingsBucket {
  currentAmount: number;
}

export interface SavingsBucketForm {
  name: string;
  icon: string;
  iconColor: string;
  targetAmount: string | null;
  currency: string;
  deadline: string | null;
}

export interface SavingsBucketDto {
  name: string;
  icon: string;
  iconColor: string;
  targetAmount: number | null;
  currency: number;
  deadline: string | null;
}

