import { configureStore } from '@reduxjs/toolkit';

import auth from './features/auth/authSlice';
import currencies from './features/currencies/currenciesSlice';
import paymentMethods from './features/paymentMethodsSlice/paymentMethodsSlice';
import lang from './features/lang/langSlice';

export default configureStore({
  reducer: {
    auth,
    currencies,
    paymentMethods,
    lang,
  },
});
