import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../../../../model/auth';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    credentials: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setCredentials: (state, action) => {
      state.credentials = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearCredentials: (state) => {
      state.credentials = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
