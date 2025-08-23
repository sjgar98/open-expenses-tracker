import { createSlice } from '@reduxjs/toolkit';
import type { ExpensesState } from '../../../model/expenses';

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    oneTime: {
      pageSize: 10,
      sortBy: 'date',
      sortOrder: 'desc',
      rangeStart: null,
      rangeEnd: null,
      category: null,
      autoSize: true,
    },
    recurring: {
      pageSize: 10,
      sortBy: 'nextOccurrence',
      sortOrder: 'asc',
    },
  } as ExpensesState,
  reducers: {
    setExpensesOneTimeAutoSize: (state, action) => {
      state.oneTime.autoSize = action.payload;
    },
    setExpensesOneTimePageSize: (state, action) => {
      state.oneTime.pageSize = action.payload;
    },
    setExpensesOneTimeSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.oneTime.sortBy = columnAccessor;
      state.oneTime.sortOrder = direction;
    },
    setExpensesOneTimeDateRange: (state, action) => {
      const [start, end] = action.payload;
      state.oneTime.rangeStart = start;
      state.oneTime.rangeEnd = end;
    },
    setExpensesOneTimeCategories: (state, action) => {
      state.oneTime.category = action.payload;
    },
    setExpensesRecurringPageSize: (state, action) => {
      state.recurring.pageSize = action.payload;
    },
    setExpensesRecurringSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.recurring.sortBy = columnAccessor;
      state.recurring.sortOrder = direction;
    },
  },
});

export const {
  setExpensesOneTimeAutoSize,
  setExpensesOneTimePageSize,
  setExpensesOneTimeSortStatus,
  setExpensesOneTimeDateRange,
  setExpensesOneTimeCategories,
  setExpensesRecurringPageSize,
  setExpensesRecurringSortStatus,
} = expensesSlice.actions;
export default expensesSlice.reducer;

