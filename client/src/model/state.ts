import type { AuthState } from './auth';
import type { CurrenciesState } from './currencies';
import type { LangState } from './lang';
import type { PaymentMethodsState } from './payment-methods';

export interface AppState {
  auth: AuthState;
  currencies: CurrenciesState;
  paymentMethods: PaymentMethodsState;
  lang: LangState;
}

