import { createSlice } from '@reduxjs/toolkit';
import type { CurrenciesState } from '../../../../model/currencies';
import { currencies } from 'currencies.json';

export const currenciesSlice = createSlice({
  name: 'currencies',
  initialState: {
    currencies: currencies.map(({ name, code, symbol }) => ({ name, code, symbol, status: false })),
    selectedCurrency: null,
  } as CurrenciesState,
  reducers: {
    setCurrencies: (state, action) => {
      state.currencies = action.payload;
    },
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
    toggleCurrencyStatus: (state, action) => {
      const currency = state.currencies.find((c) => c.code === action.payload.code);
      if (currency) {
        currency.status = !currency.status;
      }
    },
  },
});

export const { setCurrencies, setSelectedCurrency, toggleCurrencyStatus } = currenciesSlice.actions;
export default currenciesSlice.reducer;
