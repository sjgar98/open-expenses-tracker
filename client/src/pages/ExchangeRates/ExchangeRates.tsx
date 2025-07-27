import { useDispatch, useSelector } from 'react-redux';
import type { ExchangeRate } from '../../model/exchange-rates';
import type { AppState } from '../../model/state';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { setExchangeRates } from '../../services/store/features/exchangeRates/exchangeRatesSlice';
import { parseError } from '../../utils/error-parser.utils';
import Header from '../../components/Header/Header';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { DateTime } from 'luxon';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import DataGridToolbar, { type DataGridToolbarAction } from '../../components/DataGridToolbar/DataGridToolbar';

export default function ExchangeRates() {
  const { t } = useTranslation();
  const exchangeRates: ExchangeRate[] = useSelector(({ exchangeRates }: AppState) => exchangeRates.exchangeRates);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const {
    error: exchangeRatesError,
    data: exchangeRatesResponse,
    refetch: refetchExchangeRates,
  } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => ApiService.getExchangeRates(),
  });

  useEffect(() => {
    dispatch(setExchangeRates(exchangeRatesResponse ?? []));
    setIsLoading(false);
  }, [exchangeRatesResponse]);

  useEffect(() => {
    if (exchangeRatesError) {
      enqueueSnackbar(t(parseError(exchangeRatesError) ?? 'Error'), { variant: 'error' });
    }
  }, [exchangeRatesError]);

  function handleSeedExchangeRates() {
    if (isAdmin && !isSubmitting) {
      setIsSubmitting(true);
      ApiService.seedExchangeRates()
        .then(() => {
          setIsSubmitting(false);
          enqueueSnackbar(t('exchangeRates.messages.exchangeRatesUpdated'), { variant: 'success' });
          refetchExchangeRates();
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'currency',
      headerName: t('exchangeRates.table.header.currency'),
      valueGetter: (currency: ExchangeRate['currency']) => currency.name,
      flex: 1,
    },
    { field: 'rate', headerName: t('exchangeRates.table.header.rate'), type: 'number' },
    {
      field: 'lastUpdated',
      headerName: t('exchangeRates.table.header.lastUpdated'),
      valueGetter: (lastUpdated: ExchangeRate['lastUpdated']) =>
        DateTime.fromFormat(lastUpdated, 'yyyy-MM-dd').toLocaleString(),
    },
  ];

  const toolbarActions: DataGridToolbarAction[] = isAdmin
    ? [
        {
          label: t('actions.sync'),
          icon: <SyncIcon />,
          onClick: handleSeedExchangeRates,
          disabled: isSubmitting,
        },
      ]
    : [];

  return (
    <>
      <Header location={t('exchangeRates.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          sx={{ height: '100%' }}
          rows={exchangeRates}
          columns={columns}
          autosizeOnMount
          autosizeOptions={{
            columns: ['rate', 'lastUpdated'],
            includeOutliers: true,
            includeHeaders: true,
          }}
          autoPageSize
          showToolbar
          slots={{ toolbar: DataGridToolbar }}
          slotProps={{ toolbar: { actions: toolbarActions } }}
        />
      </Box>
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

