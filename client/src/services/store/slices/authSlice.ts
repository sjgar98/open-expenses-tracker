import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../../../model/auth';
import handleCredentialsResponse from '../../../utils/handle-credentials-response';

function getInitialState(): AuthState {
  const authToken = localStorage.getItem('oet_auth_jwt');
  const credentials = handleCredentialsResponse(authToken);
  if (credentials) {
    return {
      credentials: credentials,
      token: authToken,
      isAuthenticated: true,
    };
  } else {
    localStorage.removeItem('oet_auth_jwt');
    return {
      credentials: null,
      token: null,
      isAuthenticated: false,
    };
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState() as AuthState,
  reducers: {
    setCredentials: (state, action) => {
      const credentials = handleCredentialsResponse(action.payload);
      if (credentials) {
        state.credentials = credentials;
        state.token = action.payload;
        state.isAuthenticated = !!action.payload;
      } else {
        state.credentials = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    clearCredentials: (state) => {
      localStorage.removeItem('oet_auth_jwt');
      state.credentials = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

