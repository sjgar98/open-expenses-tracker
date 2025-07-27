import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../../../../model/auth';
import handleCredentialsResponse from '../../../../utils/handle-credentials-response';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    credentials: null,
    token: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setCredentials: (state, action) => {
      state.credentials = handleCredentialsResponse(action.payload);
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearCredentials: (state) => {
      state.credentials = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

