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
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';
import { setIncomeOneTimePageSize, setIncomeOneTimeSortStatus } from '../../../services/store/slices/incomeSlice';

export default function IncomeRecurring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { pageSize, sortBy, sortOrder } = useSelector(({ income }: AppState) => income.recurring);

  const { error, data, refetch } = useQuery({
    queryKey: ['incomeRecurring'],
    queryFn: () => ApiService.getUserRecurringIncome({ page, pageSize, sortBy, sortOrder }),
  });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(t(parseError(error) ?? 'Error'), { variant: 'error' });
    }
  }, [error]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, sortBy, sortOrder]);

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
      sortable: true,
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
        records={data?.items}
        columns={columns}
        idAccessor="uuid"
        totalRecords={data?.totalCount || 0}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={[5, 10, 20, 50]}
        onRecordsPerPageChange={(pageSize) => dispatch(setIncomeOneTimePageSize(pageSize))}
        recordsPerPageLabel={t('pagination.itemsPerPage')}
        sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
        onSortStatusChange={(sortStatus) => dispatch(setIncomeOneTimeSortStatus(sortStatus))}
        noRecordsText={t('pagination.noRecords')}
      />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

