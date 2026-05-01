import { createSlice } from '@reduxjs/toolkit';
import type { ExpensesState } from '../../../model/expenses';

export const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    oneTime: {
      sortBy: 'date',
      sortOrder: 'desc',
      rangeStart: null,
      rangeEnd: null,
      category: null,
      searchTerm: '',
    },
    recurring: {
      sortBy: 'nextOccurrence',
      sortOrder: 'asc',
    },
  } satisfies ExpensesState,
  reducers: {
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
    setExpensesOneTimeSearchTerm: (state, action) => {
      state.oneTime.searchTerm = action.payload;
    },
    setExpensesRecurringSortStatus: (state, action) => {
      const { columnAccessor, direction } = action.payload;
      state.recurring.sortBy = columnAccessor;
      state.recurring.sortOrder = direction;
    },
  },
});

export const {
  setExpensesOneTimeSortStatus,
  setExpensesOneTimeDateRange,
  setExpensesOneTimeCategories,
  setExpensesOneTimeSearchTerm,
  setExpensesRecurringSortStatus,
} = expensesSlice.actions;
export default expensesSlice.reducer;

