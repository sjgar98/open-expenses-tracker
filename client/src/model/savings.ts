import type { Currency } from './currencies';
import type { PaginationDto } from './pagination';
import type { SavingsBucket } from './savings-buckets';

export interface Saving {
  uuid: string;
  description: string;
  amount: number;
  currency: Currency;
  bucket: SavingsBucket;
  date: string;
}

export interface SavingForm {
  description: string;
  amount: string;
  currency: string;
  bucket: string;
  date: string;
}

export interface SavingDto {
  description: string;
  amount: number;
  currency: number;
  bucket: string;
  date: string;
}

export interface SavingFilterDto extends PaginationDto {
  sortBy: keyof Saving;
  sortOrder: 'asc' | 'desc';
  rangeStart: string | null;
  rangeEnd: string | null;
  bucket: string | null;
  searchTerm: string;
}

export interface SavingsState extends Omit<SavingFilterDto, keyof PaginationDto> {}

