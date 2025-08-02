import type { PaginationDto } from './pagination';

export interface Currency {
  id: number;
  name: string;
  code: string;
  visible: boolean;
}

export interface CurrencyDto {
  name: string;
  code: string;
  visible: boolean;
}

export interface CurrencyFilterDto extends PaginationDto {
  sortBy: keyof Currency;
  sortOrder: 'asc' | 'desc';
}

