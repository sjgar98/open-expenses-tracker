import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import store from './services/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const DARK_THEME = createTheme({ palette: { mode: 'dark' } });
  const queryClient = new QueryClient();
  return (
    <ThemeProvider theme={DARK_THEME}>
      <CssBaseline />
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>{children}</Provider>
        </QueryClientProvider>
      </CookiesProvider>
    </ThemeProvider>
  );
}
