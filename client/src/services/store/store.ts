import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import lang from './slices/langSlice';
import home from './slices/homeSlice';
import income from './slices/incomeSlice';
import expenses from './slices/expensesSlice';

export const store = configureStore({
  reducer: {
    auth,
    lang,
    home,
    income,
    expenses,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

