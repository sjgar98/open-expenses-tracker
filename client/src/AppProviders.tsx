import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { store } from './services/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  const queryClient = new QueryClient();
  const mantineTheme = createTheme({});
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <DndProvider backend={HTML5Backend}>
        <DatesProvider settings={{ locale: 'en' }}>
          <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3000}>
            <CookiesProvider>
              <QueryClientProvider client={queryClient}>
                <Provider store={store}>{children}</Provider>
              </QueryClientProvider>
            </CookiesProvider>
          </SnackbarProvider>
        </DatesProvider>
      </DndProvider>
    </MantineProvider>
  );
}

