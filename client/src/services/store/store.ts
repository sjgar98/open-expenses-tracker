import { configureStore } from '@reduxjs/toolkit';
import auth from './features/auth/authSlice';
import currencies from './features/currencies/currenciesSlice';
import exchangeRates from './features/exchangeRates/exchangeRatesSlice';
import paymentMethods from './features/paymentMethodsSlice/paymentMethodsSlice';
import accounts from './features/accounts/accountsSlice';
import lang from './features/lang/langSlice';

export const store = configureStore({
  reducer: {
    auth,
    currencies,
    exchangeRates,
    paymentMethods,
    accounts,
    lang,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

