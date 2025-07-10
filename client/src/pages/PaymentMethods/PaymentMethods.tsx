import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Box, Fab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { AppPaymentMethod } from '../../model/payment-methods';
import { useSelector } from 'react-redux';

export default function PaymentMethods() {
  const { t } = useTranslation();
  const paymentMethods: AppPaymentMethod[] = useSelector((state: any) => state.paymentMethods.paymentMethods);

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <TableContainer component={Paper}>
          <Table stickyHeader size="small" aria-label={t('paymentMethods.title')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('paymentMethods.table.header.name')}</TableCell>
                <TableCell>{t('paymentMethods.table.header.credit')}</TableCell>
                <TableCell>{t('paymentMethods.table.header.creditLimit')}</TableCell>
                <TableCell>{t('paymentMethods.table.header.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentMethods.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ color: row.status ? 'inherit' : 'text.disabled' }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: row.status ? 'inherit' : 'text.disabled' }}>
                    {row.credit ? t('yesno.yes') : t('yesno.no')}
                  </TableCell>
                  <TableCell sx={{ color: row.status ? 'inherit' : 'text.disabled' }}>{row.creditLimit}</TableCell>
                  <TableCell sx={{ color: row.status ? 'inherit' : 'text.disabled' }}>
                    {row.status ? t('status.enabled') : t('status.disabled')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </>
  );
}
