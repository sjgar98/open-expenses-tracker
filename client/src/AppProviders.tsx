import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import store from './services/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { SnackbarProvider } from 'notistack';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const DARK_THEME = createTheme({ palette: { mode: 'dark' } });
  const queryClient = new QueryClient();
  return (
    <ThemeProvider theme={DARK_THEME}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-GB">
        <SnackbarProvider>
          <CookiesProvider>
            <QueryClientProvider client={queryClient}>
              <Provider store={store}>{children}</Provider>
            </QueryClientProvider>
          </CookiesProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

