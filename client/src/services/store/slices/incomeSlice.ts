import { createSlice } from '@reduxjs/toolkit';
import type { IncomeState } from '../../../model/income';

export const incomeSlice = createSlice({
  name: 'income',
  initialState: {
    oneTime: {
      pageSize: 10,
      sortBy: 'date',
      sortOrder: 'desc',
      rangeStart: null,
      rangeEnd: null,
    },
    recurring: {
      pageSize: 10,
      sortBy: 'nextOccurrence',
      sortOrder: 'asc',
    },
  } as IncomeState,
  reducers: {
    setIncomeOneTimePageSize: (state, action) => {
      state.oneTime.pageSize = action.payload;
    },
    setIncomeOneTimeSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.oneTime.sortBy = columnAccessor;
      state.oneTime.sortOrder = direction;
    },
    setIncomeOneTimeDateRange: (state, action) => {
      const [start, end] = action.payload;
      state.oneTime.rangeStart = start;
      state.oneTime.rangeEnd = end;
    },
    setIncomeRecurringPageSize: (state, action) => {
      state.recurring.pageSize = action.payload;
    },
    setIncomeRecurringSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.recurring.sortBy = columnAccessor;
      state.recurring.sortOrder = direction;
    },
  },
});

export const {
  setIncomeOneTimePageSize,
  setIncomeOneTimeSortStatus,
  setIncomeOneTimeDateRange,
  setIncomeRecurringPageSize,
  setIncomeRecurringSortStatus,
} = incomeSlice.actions;
export default incomeSlice.reducer;

