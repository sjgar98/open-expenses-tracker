import { useTranslation } from 'react-i18next';
import type { AppState } from '../../model/state';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import type { Account } from '../../model/accounts';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { setAccounts } from '../../services/store/features/accounts/accountsSlice';
import { DataGrid, GridActionsCellItem, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { DataGridToolbarAction } from '../../components/DataGridToolbar/DataGridToolbar';
import Header from '../../components/Header/Header';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import DataGridToolbar from '../../components/DataGridToolbar/DataGridToolbar';

export default function Accounts() {
  const { t } = useTranslation();
  const accounts: Account[] = useSelector(({ accounts }: AppState) => accounts.accounts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: accountsError, data: accountsResponse } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => ApiService.getAccounts(),
  });

  useEffect(() => {
    dispatch(setAccounts(accountsResponse ?? []));
    setIsLoading(false);
  }, [accountsResponse]);

  useEffect(() => {
    if (accountsError) {
      enqueueSnackbar(t('Error fetching accounts'), { variant: 'error' });
    }
  }, [accountsError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(account: Account) {
    navigate(`./edit/${account.uuid}`);
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('accounts.table.header.name'), flex: 1 },
    { field: 'balance', headerName: t('accounts.table.header.balance'), flex: 1 },
    {
      field: 'currency',
      headerName: t('accounts.table.header.currency'),
      flex: 1,
      valueGetter: (currency: Account['currency']) => currency.code,
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 50,
      getActions: (params: GridRowParams<Account>) => [
        <GridActionsCellItem icon={<EditIcon />} label={t('actions.edit')} onClick={() => handleEdit(params.row)} />,
      ],
    },
  ];

  const toolbarActions: DataGridToolbarAction[] = [
    {
      label: t('actions.new'),
      icon: <AddIcon />,
      onClick: handleAdd,
    },
  ];

  return (
    <>
      <Header location={t('accounts.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          sx={{ height: '100%' }}
          getRowId={(row) => row.uuid}
          rows={accounts}
          columns={columns}
          autosizeOnMount
          autosizeOptions={{
            columns: [],
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

