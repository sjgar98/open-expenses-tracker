import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import store from './services/store/store';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const DARK_THEME = createTheme({ palette: { mode: 'dark' } });
  return (
    <ThemeProvider theme={DARK_THEME}>
      <CssBaseline />
      <CookiesProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <Provider store={store}>{children}</Provider>
        </GoogleOAuthProvider>
      </CookiesProvider>
    </ThemeProvider>
  );
}
