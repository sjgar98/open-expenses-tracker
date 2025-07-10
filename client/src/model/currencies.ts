export interface AppCurrency {
  name: string;
  code: string;
  symbol: string;
  status: boolean;
}

export interface CurrenciesState {
  currencies: AppCurrency[];
  selectedCurrency: AppCurrency | null;
}
