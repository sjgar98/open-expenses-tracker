import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { Currency } from '../../model/currencies';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setCurrencies } from '../../services/store/features/currencies/currenciesSlice';
import NewCurrencyDialog from './components/NewCurrencyDialog';
import EditCurrencyDialog from './components/EditCurrencyDialog';
import { ApiService } from '../../services/api/api.service';

export default function Currencies() {
  const { t } = useTranslation();
  const currencies: Currency[] = useSelector((state: any) => state.currencies.currencies);
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isNewDialogOpen, setNewDialogOpen] = useState(false);
  const [isEditingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const {
    isPending,
    error,
    refetch: refetchCurrencies,
    data: currenciesResponse,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrenciesAll(),
  });

  useEffect(() => {
    dispatch(setCurrencies(currenciesResponse ?? []));
  }, [currenciesResponse]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function handleSaveNewCurrency(data: Omit<Currency, 'id'>) {
    ApiService.saveNewCurrency(data)
      .then(() => {
        refetchCurrencies();
        setNewDialogOpen(false);
      })
      .catch(() => {
        setNewDialogOpen(false);
      });
  }

  function handleSaveEditCurrency(data: Currency) {
    ApiService.saveEditCurrency(data)
      .then(() => {
        refetchCurrencies();
        setEditingCurrency(null);
      })
      .catch(() => {
        setEditingCurrency(null);
      });
  }

  function handleDeleteCurrency(currency: Currency) {
    ApiService.deleteCurrency(currency.id)
      .then(() => {
        refetchCurrencies();
        setEditingCurrency(null);
      })
      .catch(() => {
        setEditingCurrency(null);
      });
  }

  const handleAdd = () => {
    setNewDialogOpen(true);
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
  };

  return (
    <>
      <Header location={t('currencies.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container py-3">
          <div className="row">
            <div className="col">
              {isPending && <CircularProgress />}
              {Boolean(!isPending && !error) && (
                <>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead sx={{ height: 70 }}>
                        <TableRow>
                          <TableCell>{t('currencies.table.header.name')}</TableCell>
                          <TableCell>{t('currencies.table.header.iso')}</TableCell>
                          <TableCell>{t('currencies.table.header.symbol')}</TableCell>
                          <TableCell>{t('currencies.table.header.status')}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Button sx={{ minWidth: 'max-content' }} color="success" onClick={handleAdd}>
                                <AddIcon />
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currencies.map((currency) => (
                          <TableRow key={currency.id}>
                            <TableCell>{currency.name}</TableCell>
                            <TableCell>{currency.code}</TableCell>
                            <TableCell>{currency.symbol}</TableCell>
                            <TableCell>{currency.status ? t('status.enabled') : t('status.disabled')}</TableCell>
                            <TableCell sx={{ width: '1%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button sx={{ minWidth: 'max-content' }} onClick={() => handleEdit(currency)}>
                                  <EditIcon />
                                </Button>
                              </Box>
                            </TableCell>
                            <EditCurrencyDialog
                              currency={currency}
                              open={isEditingCurrency === currency}
                              onSave={handleSaveEditCurrency}
                              onDelete={handleDeleteCurrency}
                              onCancel={() => setEditingCurrency(null)}
                            />
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={currencies.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('table.pagination.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('table.pagination.of')} ${count}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Box>
      <NewCurrencyDialog
        open={isNewDialogOpen}
        onSubmit={handleSaveNewCurrency}
        onCancel={() => setNewDialogOpen(false)}
      />
    </>
  );
}
