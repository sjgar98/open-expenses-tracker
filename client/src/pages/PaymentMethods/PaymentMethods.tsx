import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Backdrop, Box, CircularProgress } from '@mui/material';
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
import { DataGrid, GridActionsCellItem, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import DataGridToolbar, { type DataGridToolbarAction } from '../../components/DataGridToolbar/DataGridToolbar';

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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('paymentMethods.table.header.name'),
      flex: 1,
    },
    { field: 'credit', headerName: t('paymentMethods.table.header.credit'), type: 'boolean' },
    {
      field: 'creditClosingDateRule',
      headerName: t('paymentMethods.table.header.creditClosingDateRule'),
      valueGetter: (creditClosingDateRule: PaymentMethod['creditClosingDateRule'], row: PaymentMethod) =>
        row.credit ? rrulestr(creditClosingDateRule!).after(new Date())?.toDateString() : '',
      flex: 1,
    },
    {
      field: 'creditDueDateRule',
      headerName: t('paymentMethods.table.header.creditDueDateRule'),
      valueGetter: (creditDueDateRule: PaymentMethod['creditDueDateRule'], row: PaymentMethod) =>
        row.credit
          ? rrulestr(creditDueDateRule!).after(rrulestr(row.creditClosingDateRule!).after(new Date())!)?.toDateString()
          : '',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 50,
      getActions: (params: GridRowParams<PaymentMethod>) => [
        <GridActionsCellItem icon={<EditIcon />} label={t('actions.edit')} onClick={() => handleEdit(params.row)} />,
      ],
    },
  ];

  const toolbarActions: DataGridToolbarAction[] = [
    {
      label: t('actions.sync'),
      icon: <AddIcon />,
      onClick: handleAdd,
    },
  ];

  return (
    <>
      <Header location={t('paymentMethods.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          sx={{ height: '100%' }}
          getRowId={(row) => row.uuid}
          rows={paymentMethods}
          columns={columns}
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

