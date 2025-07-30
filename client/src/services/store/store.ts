import { configureStore } from '@reduxjs/toolkit';
import auth from './features/auth/authSlice';
import lang from './features/lang/langSlice';

export const store = configureStore({
  reducer: {
    auth,
    lang,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

