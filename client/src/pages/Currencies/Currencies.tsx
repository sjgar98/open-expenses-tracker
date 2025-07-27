import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Backdrop, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { Currency } from '../../model/currencies';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setCurrencies } from '../../services/store/features/currencies/currenciesSlice';
import { ApiService } from '../../services/api/api.service';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';
import type { AppState } from '../../model/state';

export default function Currencies() {
  const { t } = useTranslation();
  const currencies: Currency[] = useSelector(({ currencies }: AppState) => currencies.currencies);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const {
    error: currenciesError,
    data: currenciesResponse,
    refetch: refetchCurrencies,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrenciesAll(),
  });

  useEffect(() => {
    dispatch(setCurrencies(currenciesResponse ?? []));
    setIsLoading(false);
  }, [currenciesResponse]);

  useEffect(() => {
    if (currenciesError) {
      enqueueSnackbar(t(parseError(currenciesError) ?? 'Error'), {
        variant: 'error',
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
    }
  }, [currenciesError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(currency: Currency) {
    navigate(`./edit/${currency.id}`);
  }

  function handleSeedCurrencies() {
    if (isAdmin) {
      ApiService.seedCurrencies()
        .then(() => {
          refetchCurrencies();
        })
        .catch((error) => {
          console.error('Error seeding currencies:', error);
        });
    }
  }

  return (
    <>
      <Header location={t('currencies.title')} />
      {!isLoading && (
        <Box sx={{ flexGrow: 1 }}>
          <div className="container py-3">
            <div className="row">
              <div className="col">
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ height: 70 }}>
                      <TableRow>
                        <TableCell>{t('currencies.table.header.name')}</TableCell>
                        <TableCell>{t('currencies.table.header.code')}</TableCell>
                        <TableCell>{t('currencies.table.header.visible')}</TableCell>
                        <TableCell>
                          {isAdmin && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button sx={{ minWidth: 'max-content' }} color="primary" onClick={handleSeedCurrencies}>
                                <CloudDownloadIcon />
                              </Button>
                              <Button sx={{ minWidth: 'max-content' }} color="success" onClick={handleAdd}>
                                <AddIcon />
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currencies.map((currency) => (
                        <TableRow key={currency.id} sx={{ height: 50 }}>
                          <TableCell className={currency.visible ? '' : 'text-secondary'}>{currency.name}</TableCell>
                          <TableCell className={currency.visible ? '' : 'text-secondary'}>{currency.code}</TableCell>
                          <TableCell className={currency.visible ? '' : 'text-secondary'}>
                            {currency.visible ? t('yesno.yes') : t('yesno.no')}
                          </TableCell>
                          <TableCell sx={{ width: '1%' }}>
                            {isAdmin && currency.code !== 'USD' && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button sx={{ minWidth: 'max-content' }} onClick={() => handleEdit(currency)}>
                                  <EditIcon />
                                </Button>
                              </Box>
                            )}
                          </TableCell>
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

