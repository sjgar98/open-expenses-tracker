import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { store } from './services/store/store';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QUERY_CACHE_MAX_AGE, queryClient, queryPersister } from './services/query/query-client';
import { SnackbarProvider } from 'notistack';
import { createTheme, darken, DEFAULT_THEME, MantineProvider, type CSSVariablesResolver } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import 'mantine-datatable/styles.css';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/en';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-green-filled': 'var(--mantine-color-green-9)',
    '--mantine-color-green-filled-hover': darken(DEFAULT_THEME.colors.green[9], 0.15),
    '--mantine-color-green-outline': 'var(--mantine-color-green-9)',
  },
  dark: {},
});

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const mantineTheme = createTheme({
    primaryShade: { light: 8, dark: 8 },
    autoContrast: true,
  });
  return (
    <MantineProvider theme={mantineTheme} cssVariablesResolver={cssVariablesResolver} defaultColorScheme="auto">
      <DndProvider backend={HTML5Backend}>
        <DatesProvider settings={{ locale: 'en' }}>
          <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000}>
            <CookiesProvider>
              <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{ persister: queryPersister, maxAge: QUERY_CACHE_MAX_AGE, buster: __APP_VERSION__ }}
              >
                <Provider store={store}>{children}</Provider>
              </PersistQueryClientProvider>
            </CookiesProvider>
          </SnackbarProvider>
        </DatesProvider>
      </DndProvider>
    </MantineProvider>
  );
}
