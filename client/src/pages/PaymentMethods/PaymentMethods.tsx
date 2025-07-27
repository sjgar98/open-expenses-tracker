import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Backdrop, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type { PaymentMethod } from '../../model/payment-methods';
import { useDispatch, useSelector } from 'react-redux';
import { rrulestr } from 'rrule';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { setPaymentMethods } from '../../services/store/features/paymentMethodsSlice/paymentMethodsSlice';
import { useNavigate } from 'react-router';
import type { AppState } from '../../model/state';
import { useSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';

export default function PaymentMethods() {
  const { t } = useTranslation();
  const paymentMethods: PaymentMethod[] = useSelector(({ paymentMethods }: AppState) => paymentMethods.paymentMethods);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: paymentMethodsError, data: paymentMethodsResponse } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => ApiService.getUserPaymentMethods(),
  });

  useEffect(() => {
    dispatch(setPaymentMethods(paymentMethodsResponse ?? []));
    setIsLoading(false);
  }, [paymentMethodsResponse]);

  useEffect(() => {
    if (paymentMethodsError) {
      enqueueSnackbar(t(parseError(paymentMethodsError) ?? 'Error'), { variant: 'error' });
    }
  }, [paymentMethodsError]);

  const handleAdd = () => {
    navigate('./new');
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    navigate(`./edit/${paymentMethod.uuid}`);
  };

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <div className="container py-3">
          <div className="row">
            <div className="col">
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ height: 70 }}>
                    <TableRow>
                      <TableCell>{t('paymentMethods.table.header.name')}</TableCell>
                      <TableCell>{t('paymentMethods.table.header.credit')}</TableCell>
                      <TableCell>{t('paymentMethods.table.header.creditClosingDateRule')}</TableCell>
                      <TableCell>{t('paymentMethods.table.header.creditDueDateRule')}</TableCell>
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
                    {paymentMethods.map((row) => (
                      <TableRow key={row.uuid}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.credit ? t('yesno.yes') : t('yesno.no')}</TableCell>
                        <TableCell>
                          {row.credit ? rrulestr(row.creditClosingDateRule!).after(new Date())?.toDateString() : ''}
                        </TableCell>
                        <TableCell>
                          {row.credit
                            ? rrulestr(row.creditDueDateRule!)
                                .after(rrulestr(row.creditClosingDateRule!).after(new Date())!)
                                ?.toDateString()
                            : ''}
                        </TableCell>
                        <TableCell sx={{ width: '1%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button sx={{ minWidth: 'max-content' }} onClick={() => handleEdit(row)}>
                              <EditIcon />
                            </Button>
                          </Box>
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
      <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

