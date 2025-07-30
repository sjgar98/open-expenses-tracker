import type { Currency } from './currencies';

export interface ExchangeRate {
  id: number;
  currency: Currency;
  rate: number;
  lastUpdated: string;
}

