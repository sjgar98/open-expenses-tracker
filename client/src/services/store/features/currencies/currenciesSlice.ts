import { createSlice } from '@reduxjs/toolkit';
import type { CurrenciesState } from '../../../../model/currencies';

export const currenciesSlice = createSlice({
  name: 'currencies',
  initialState: {
    currencies: [],
    selectedCurrency: null,
  } as CurrenciesState,
  reducers: {
    setCurrencies: (state, action) => {
      state.currencies = action.payload;
    },
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
  },
});

export const { setCurrencies, setSelectedCurrency } = currenciesSlice.actions;
export default currenciesSlice.reducer;
