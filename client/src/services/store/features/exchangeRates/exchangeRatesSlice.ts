import { createSlice } from '@reduxjs/toolkit';
import type { ExchangeRatesState } from '../../../../model/exchange-rates';

export const exchangeRatesSlice = createSlice({
  name: 'exchangeRates',
  initialState: {
    exchangeRates: [],
  } as ExchangeRatesState,
  reducers: {
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload;
    },
  },
});

export const { setExchangeRates } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;

