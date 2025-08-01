import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../../services/api/api.service';
import { enqueueSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import type { RecurringExpense } from '../../../model/expenses';
import { DataTable, type DataTableColumn, type DataTableSortStatus } from 'mantine-datatable';
import { ActionIcon, Box, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { DateTime } from 'luxon';

export default function ExpensesRecurring() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<RecurringExpense>>({
    columnAccessor: 'nextOccurrence',
    direction: 'asc',
  });

  const { error, data, refetch } = useQuery({
    queryKey: ['expensesRecurring'],
    queryFn: () =>
      ApiService.getUserExpensesRecurring({
        page,
        pageSize,
        sortBy: sortStatus.columnAccessor as keyof RecurringExpense,
        sortOrder: sortStatus.direction,
      }),
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
  }, [page, pageSize, sortStatus]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(recurringExpense: RecurringExpense) {
    navigate(`./edit/${recurringExpense.uuid}`);
  }

  const columns: DataTableColumn<RecurringExpense>[] = [
    {
      accessor: 'description',
      title: t('expenses.recurring.table.header.description'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
    },
    {
      accessor: 'amount',
      title: t('expenses.recurring.table.header.amount'),
      textAlign: 'right',
      render: (recurringExpense) => (
        <NumberFormatter
          suffix={` ${recurringExpense.currency.code}`}
          value={recurringExpense.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'taxes',
      title: t('expenses.recurring.table.header.taxes'),
      textAlign: 'right',
      render: (recurringExpense) => (
        <NumberFormatter
          suffix={` ${recurringExpense.currency.code}`}
          value={
            recurringExpense.taxes.map((tax) => tax.rate / 100).reduce((acc, rate) => acc + rate, 0) *
            recurringExpense.amount
          }
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'paymentMethod',
      title: t('expenses.recurring.table.header.paymentMethod'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (recurringExpense) =>
        recurringExpense.paymentMethod && (
          <Box className="d-flex align-items-center gap-2">
            <MaterialIcon color={recurringExpense.paymentMethod.iconColor} size={24}>
              {recurringExpense.paymentMethod.icon}
            </MaterialIcon>
            <span>{recurringExpense.paymentMethod.name}</span>
          </Box>
        ),
    },
    {
      accessor: 'status',
      title: t('expenses.recurring.table.header.status'),
      render: (currency) => (currency.status ? t('yesno.yes') : t('yesno.no')),
    },
    {
      accessor: 'lastOccurrence',
      title: t('expenses.recurring.table.header.lastOccurrence'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (recurringExpense) =>
        recurringExpense.lastOccurrence ? DateTime.fromISO(recurringExpense.lastOccurrence).toLocaleString() : '',
    },
    {
      accessor: 'nextOccurrence',
      title: t('expenses.recurring.table.header.nextOccurrence'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      sortable: true,
      render: (recurringExpense) =>
        recurringExpense.nextOccurrence ? DateTime.fromISO(recurringExpense.nextOccurrence).toLocaleString() : '',
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
      textAlign: 'right',
      render: (recurringExpense) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(recurringExpense)}>
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
        onRecordsPerPageChange={setPageSize}
        recordsPerPageLabel={t('pagination.itemsPerPage')}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        noRecordsText={t('pagination.noRecords')}
      />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

