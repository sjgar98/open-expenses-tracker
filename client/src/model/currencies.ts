export interface Currency {
  id: number;
  name: string;
  code: string;
  visible: boolean;
}

export interface CurrenciesState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
}
