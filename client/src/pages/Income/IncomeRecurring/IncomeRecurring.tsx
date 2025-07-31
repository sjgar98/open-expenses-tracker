import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { parseError } from '../../../utils/error-parser.utils';
import { enqueueSnackbar } from 'notistack';
import type { RecurringIncome } from '../../../model/income';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Box, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { DateTime } from 'luxon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';

export default function IncomeRecurring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const { error: incomeRecurringError, data: incomeRecurringResponse } = useQuery({
    queryKey: ['incomeRecurring'],
    queryFn: () => ApiService.getUserRecurringIncome(),
  });

  useEffect(() => {
    if (incomeRecurringResponse) {
      setIsLoading(false);
    }
  }, [incomeRecurringResponse]);

  useEffect(() => {
    if (incomeRecurringError) {
      enqueueSnackbar(t(parseError(incomeRecurringError) ?? 'Error'), { variant: 'error' });
    }
  }, [incomeRecurringError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(recurringIncome: RecurringIncome) {
    navigate(`./edit/${recurringIncome.uuid}`);
  }

  const columns: DataTableColumn<RecurringIncome>[] = [
    {
      accessor: 'description',
      title: t('income.recurring.table.header.description'),
    },
    {
      accessor: 'amount',
      title: t('income.recurring.table.header.amount'),
      textAlign: 'right',
      render: (recurringIncome) => (
        <NumberFormatter
          suffix={` ${recurringIncome.currency.code}`}
          value={recurringIncome.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'account',
      title: t('income.recurring.table.header.account'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (income) => (
        <Box className="d-flex align-items-center gap-2">
          <MaterialIcon color={income.account.iconColor} size={24}>
            {income.account.icon}
          </MaterialIcon>
          <span>{income.account.name}</span>
        </Box>
      ),
    },
    {
      accessor: 'status',
      title: t('income.recurring.table.header.status'),
      render: (currency) => (currency.status ? t('yesno.yes') : t('yesno.no')),
    },
    {
      accessor: 'lastOccurrence',
      title: t('income.recurring.table.header.lastOccurrence'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (recurringIncome) =>
        recurringIncome.lastOccurrence ? DateTime.fromISO(recurringIncome.lastOccurrence).toLocaleString() : '',
    },
    {
      accessor: 'nextOccurrence',
      title: t('income.recurring.table.header.nextOccurrence'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (recurringIncome) =>
        recurringIncome.nextOccurrence ? DateTime.fromISO(recurringIncome.nextOccurrence).toLocaleString() : '',
    },
    {
      accessor: 'actions',
      title: (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.new')}>
            <ActionIcon variant="subtle" color="green" onClick={() => handleAdd()}>
              <IconTablePlus />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      render: (recurringIncome) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(recurringIncome)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <DataTable
        withTableBorder
        highlightOnHover
        records={incomeRecurringResponse}
        columns={columns}
        idAccessor="uuid"
      />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

