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
import { Backdrop, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { DateTime } from 'luxon';

export default function ExchangeRates() {
  const { t } = useTranslation();
  const exchangeRates: ExchangeRate[] = useSelector(({ exchangeRates }: AppState) => exchangeRates.exchangeRates);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
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
      enqueueSnackbar(t(parseError(exchangeRatesError) ?? 'Error'), {
        variant: 'error',
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
    }
  }, [exchangeRatesError]);

  function handleSeedExchangeRates() {
    if (isAdmin) {
      ApiService.seedExchangeRates()
        .then(() => {
          refetchExchangeRates();
        })
        .catch((error) => {
          enqueueSnackbar(t(parseError(error) ?? 'Error'), {
            variant: 'error',
            anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
          });
        });
    }
  }

  return (
    <>
      <Header location={t('exchangeRates.title')} />
      {!isLoading && (
        <Box sx={{ flexGrow: 1 }}>
          <div className="container py-3">
            <div className="row">
              <div className="col">
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ height: 70 }}>
                      <TableRow>
                        <TableCell>{t('exchangeRates.table.header.currency')}</TableCell>
                        <TableCell>{t('exchangeRates.table.header.rate')}</TableCell>
                        <TableCell>{t('exchangeRates.table.header.lastUpdated')}</TableCell>
                        <TableCell>
                          {isAdmin && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button
                                sx={{ minWidth: 'max-content' }}
                                color="primary"
                                onClick={handleSeedExchangeRates}
                              >
                                <CloudDownloadIcon />
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exchangeRates.map((exchangeRate) => (
                        <TableRow key={exchangeRate.id} sx={{ height: 50 }}>
                          <TableCell>{exchangeRate.currency.code}</TableCell>
                          <TableCell>{exchangeRate.rate}</TableCell>
                          <TableCell>
                            {DateTime.fromFormat(exchangeRate.lastUpdated, 'yyyy-MM-dd').toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ width: '1%' }}></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        </Box>
      )}
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

