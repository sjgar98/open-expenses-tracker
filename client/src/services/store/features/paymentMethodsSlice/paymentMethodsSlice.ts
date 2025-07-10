import { createSlice } from '@reduxjs/toolkit';
import type { PaymentMethodsState } from '../../../../model/payment-methods';

export const paymentMethodsSlice = createSlice({
  name: 'paymentMethods',
  initialState: {
    paymentMethods: [
      {
        id: 1,
        name: 'Credit Card',
        credit: true,
        creditLimit: 50000,
        status: true,
      },
      {
        id: 2,
        name: 'Bank Transfer',
        credit: false,
        creditLimit: null,
        status: true,
      },
      {
        id: 3,
        name: 'MercadoPago',
        credit: false,
        creditLimit: null,
        status: false,
      },
    ],
  } as PaymentMethodsState,
  reducers: {
    setPaymentMethods: (state, action) => {
      state.paymentMethods = action.payload;
    },
  },
});

export const { setPaymentMethods } = paymentMethodsSlice.actions;
export default paymentMethodsSlice.reducer;
