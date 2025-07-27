import { createSlice } from '@reduxjs/toolkit';
import type { PaymentMethodsState } from '../../../../model/payment-methods';

export const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState: {
    paymentMethods: [],
  } as PaymentMethodsState,
  reducers: {
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
  },
});

export const { setPaymentMethods } = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;

