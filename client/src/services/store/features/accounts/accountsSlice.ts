import { createSlice } from '@reduxjs/toolkit';
import type { AccountsState } from '../../../../model/accounts';
import { ApiService } from '../../../api/api.service';

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [],
    initialized: false,
  } as AccountsState,
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload;
      state.initialized = true;
    },
    fetchAccounts: (state) => {
      ApiService.getAccounts().then((accounts) => {
        state.accounts = accounts;
        state.initialized = true;
      });
    },
  },
});

export const { setAccounts, fetchAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;

