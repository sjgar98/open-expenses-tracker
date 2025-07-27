import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import { Backdrop, Box, CircularProgress } from '@mui/material';
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
import { DataGrid, type GridColDef, GridActionsCellItem, type GridRowParams } from '@mui/x-data-grid';
import DataGridToolbar, { type DataGridToolbarAction } from '../../components/DataGridToolbar/DataGridToolbar';

export default function Currencies() {
  const { t } = useTranslation();
  const currencies: Currency[] = useSelector(({ currencies }: AppState) => currencies.currencies);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const {
    error: currenciesError,
    data: currenciesResponse,
    refetch: refetchCurrencies,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrencies(),
  });

  useEffect(() => {
    dispatch(setCurrencies(currenciesResponse ?? []));
    setIsLoading(false);
  }, [currenciesResponse]);

  useEffect(() => {
    if (currenciesError) {
      enqueueSnackbar(t(parseError(currenciesError) ?? 'Error'), { variant: 'error' });
    }
  }, [currenciesError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(currency: Currency) {
    navigate(`./edit/${currency.id}`);
  }

  function handleSeedCurrencies() {
    if (isAdmin && !isSubmitting) {
      setIsSubmitting(true);
      ApiService.seedCurrencies()
        .then(() => {
          setIsSubmitting(false);
          refetchCurrencies();
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('currencies.table.header.name'), flex: 1 },
    { field: 'code', headerName: t('currencies.table.header.code') },
    { field: 'visible', headerName: t('currencies.table.header.visible'), type: 'boolean' },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 50,
      getActions: (params: GridRowParams<Currency>) =>
        isAdmin && params.row.code !== 'USD'
          ? [
              <GridActionsCellItem
                icon={<EditIcon />}
                label={t('actions.edit')}
                onClick={() => handleEdit(params.row)}
              />,
            ]
          : [],
    },
  ];

  const toolbarActions: DataGridToolbarAction[] = isAdmin
    ? [
        {
          label: t('actions.sync'),
          icon: <CloudDownloadIcon />,
          onClick: handleSeedCurrencies,
          disabled: isSubmitting,
        },
        {
          label: t('actions.new'),
          icon: <AddIcon />,
          onClick: handleAdd,
          disabled: isSubmitting,
        },
      ]
    : [];

  return (
    <>
      <Header location={t('currencies.title')} />
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          sx={{ height: '100%' }}
          rows={currencies}
          columns={columns}
          autosizeOnMount
          autosizeOptions={{
            columns: ['code', 'visible'],
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

