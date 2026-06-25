import { createSlice } from '@reduxjs/toolkit';
import type { SavingsState } from '../../../model/savings';

export const savingsSlice = createSlice({
  name: 'savings',
  initialState: {
    sortBy: 'date',
    sortOrder: 'desc',
    rangeStart: null,
    rangeEnd: null,
    bucket: null,
    searchTerm: '',
  } satisfies SavingsState,
  reducers: {
    setSavingsSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.sortBy = columnAccessor;
      state.sortOrder = direction;
    },
    setSavingsDateRange: (state, action) => {
      const [start, end] = action.payload;
      state.rangeStart = start;
      state.rangeEnd = end;
    },
    setSavingsBucket: (state, action) => {
      state.bucket = action.payload;
    },
    setSavingsSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
  },
});

export const { setSavingsSortStatus, setSavingsDateRange, setSavingsBucket, setSavingsSearchTerm } =
  savingsSlice.actions;
export default savingsSlice.reducer;

