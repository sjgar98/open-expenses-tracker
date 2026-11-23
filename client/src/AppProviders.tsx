import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { store } from './services/store/store';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QUERY_CACHE_MAX_AGE, queryClient, queryPersister } from './services/query/query-client';
import { SnackbarProvider } from 'notistack';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import 'mantine-datatable/styles.css';
import { DatesProvider } from '@mantine/dates';
import 'dayjs/locale/en';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const mantineTheme = createTheme({});
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
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
