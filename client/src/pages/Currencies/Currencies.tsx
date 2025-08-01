import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { Currency } from '../../model/currencies';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api/api.service';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';
import type { AppState } from '../../model/state';
import Layout from '../../components/Layout/Layout';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import { IconCloudDownload, IconEdit, IconTablePlus } from '@tabler/icons-react';

export default function Currencies() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const {
    error: currenciesError,
    data: currencies,
    refetch: refetchCurrencies,
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => ApiService.getCurrencies(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [currencies]);

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
        .then((seededCurrencies) => {
          setIsSubmitting(false);
          refetchCurrencies();
          enqueueSnackbar(t('currencies.messages.currenciesSeeded').replace('#QTY#', String(seededCurrencies)), {
            variant: 'success',
          });
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  const columns: DataTableColumn<Currency>[] = [
    {
      accessor: 'name',
      title: t('currencies.table.header.name'),
    },
    {
      accessor: 'code',
      title: t('currencies.table.header.code'),
    },
    {
      accessor: 'visible',
      title: t('currencies.table.header.visible'),
      render: (currency) => (currency.visible ? t('yesno.yes') : t('yesno.no')),
    },
    {
      accessor: 'actions',
      title: (
        <>
          <Group gap={8} justify="right" wrap="nowrap">
            {isAdmin && (
              <>
                <Tooltip label={t('actions.sync')}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleSeedCurrencies()}
                    disabled={isSubmitting}
                  >
                    <IconCloudDownload />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('actions.new')}>
                  <ActionIcon variant="subtle" color="green" onClick={() => handleAdd()} disabled={isSubmitting}>
                    <IconTablePlus />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
        </>
      ),
      render: (currency) => (
        <Group gap={4} justify="right" wrap="nowrap">
          {isAdmin && currency.code !== 'USD' && (
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(currency)} disabled={isSubmitting}>
              <IconEdit />
            </ActionIcon>
          )}
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={currencies} columns={columns} idAccessor="id" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

