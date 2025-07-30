import { useSelector } from 'react-redux';
import type { ExchangeRate } from '../../model/exchange-rates';
import type { AppState } from '../../model/state';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { parseError } from '../../utils/error-parser.utils';
import { DateTime } from 'luxon';
import Layout from '../../components/Layout/Layout';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import { IconCloudDownload } from '@tabler/icons-react';

export default function ExchangeRates() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = useSelector(({ auth }: AppState) => Boolean(auth.credentials?.isAdmin));

  const {
    error: exchangeRatesError,
    data: exchangeRates,
    refetch: refetchExchangeRates,
  } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => ApiService.getExchangeRates(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [exchangeRates]);

  useEffect(() => {
    if (exchangeRatesError) {
      enqueueSnackbar(t(parseError(exchangeRatesError) ?? 'Error'), { variant: 'error' });
    }
  }, [exchangeRatesError]);

  function handleSeedExchangeRates() {
    if (isAdmin && !isSubmitting) {
      setIsSubmitting(true);
      ApiService.seedExchangeRates()
        .then((updatedExchangeRates) => {
          setIsSubmitting(false);
          enqueueSnackbar(
            t('exchangeRates.messages.exchangeRatesUpdated').replace('#QTY#', String(updatedExchangeRates)),
            { variant: 'success' }
          );
          refetchExchangeRates();
        })
        .catch((error) => {
          setIsSubmitting(false);
          enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
        });
    }
  }

  const columns: DataTableColumn<ExchangeRate>[] = [
    {
      accessor: 'currency',
      title: t('exchangeRates.table.header.currency'),
      render: (exchangeRate) => `(${exchangeRate.currency.code}) ${exchangeRate.currency.name}`,
    },
    { accessor: 'rate', title: t('exchangeRates.table.header.rate') },
    {
      accessor: 'lastUpdated',
      title: t('exchangeRates.table.header.lastUpdated'),
      render: (exchangeRate) => DateTime.fromFormat(exchangeRate.lastUpdated, 'yyyy-MM-dd').toLocaleString(),
    },
    {
      accessor: 'actions',
      title: (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.sync')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleSeedExchangeRates()}>
              <IconCloudDownload />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      render: () => <></>,
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={exchangeRates} columns={columns} idAccessor="id" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

