import type { AuthState } from './auth';
import type { CurrenciesState } from './currencies';
import type { ExchangeRatesState } from './exchange-rates';
import type { LangState } from './lang';
import type { PaymentMethodsState } from './payment-methods';

export interface AppState {
  auth: AuthState;
  currencies: CurrenciesState;
  exchangeRates: ExchangeRatesState;
  paymentMethods: PaymentMethodsState;
  lang: LangState;
}

