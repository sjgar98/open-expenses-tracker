import { createSlice } from '@reduxjs/toolkit';
import type { IncomeState } from '../../../model/income';

export const incomeSlice = createSlice({
  name: 'income',
  initialState: {
    oneTime: {
      sortBy: 'date',
      sortOrder: 'desc',
      rangeStart: null,
      rangeEnd: null,
    },
    recurring: {
      sortBy: 'nextOccurrence',
      sortOrder: 'asc',
    },
  } satisfies IncomeState,
  reducers: {
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
    setIncomeRecurringSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.recurring.sortBy = columnAccessor;
      state.recurring.sortOrder = direction;
    },
  },
});

export const { setIncomeOneTimeSortStatus, setIncomeOneTimeDateRange, setIncomeRecurringSortStatus } =
  incomeSlice.actions;
export default incomeSlice.reducer;

