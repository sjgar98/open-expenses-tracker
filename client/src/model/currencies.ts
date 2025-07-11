export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  status: boolean;
}

export interface CurrenciesState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
}
