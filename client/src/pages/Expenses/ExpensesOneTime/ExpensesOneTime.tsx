import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../../services/api/api.service';
import { enqueueSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import type { Expense } from '../../../model/expenses';
import { DateTime } from 'luxon';
import { ActionIcon, Box, Flex, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';
import { setExpensesOneTimeDateRange, setExpensesOneTimePageSize, setExpensesOneTimeSortStatus, } from '../../../services/store/slices/expensesSlice';

export default function ExpensesOneTime() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { pageSize, sortBy, sortOrder, rangeStart, rangeEnd } = useSelector(
    ({ expenses }: AppState) => expenses.oneTime
  );

  const { error, data, refetch } = useQuery({
    queryKey: ['expensesOneTime'],
    queryFn: () => ApiService.getUserExpenses({ page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd }),
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
  }, [page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(expense: Expense) {
    navigate(`./edit/${expense.uuid}`);
  }

  const columns: DataTableColumn<Expense>[] = [
    {
      accessor: 'date',
      title: t('expenses.onetime.table.header.date'),
      sortable: true,
      render: (expense) => DateTime.fromISO(expense.date).toLocaleString(),
    },
    {
      accessor: 'description',
      title: t('expenses.onetime.table.header.description'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
    },
    {
      accessor: 'amount',
      title: t('expenses.onetime.table.header.amount'),
      textAlign: 'right',
      render: (expense) => (
        <NumberFormatter
          suffix={` ${expense.currency.code}`}
          value={expense.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'taxes',
      title: t('expenses.onetime.table.header.taxes'),
      textAlign: 'right',
      render: (expense) => (
        <NumberFormatter
          suffix={` ${expense.currency.code}`}
          value={expense.taxes.map((tax) => tax.rate / 100).reduce((acc, rate) => acc + rate, 0) * expense.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'category',
      title: t('expenses.onetime.table.header.category'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (expense) =>
        expense.category && (
          <Box className="d-flex align-items-center gap-2">
            <MaterialIcon color={expense.category.iconColor} size={24}>
              {expense.category.icon}
            </MaterialIcon>
            <span>{expense.category.name}</span>
          </Box>
        ),
    },
    {
      accessor: 'paymentMethod',
      title: t('expenses.onetime.table.header.paymentMethod'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (expense) =>
        expense.paymentMethod && (
          <Box className="d-flex align-items-center gap-2">
            <MaterialIcon color={expense.paymentMethod.iconColor} size={24}>
              {expense.paymentMethod.icon}
            </MaterialIcon>
            <span>{expense.paymentMethod.name}</span>
          </Box>
        ),
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
      render: (expense) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(expense)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Flex className="m-2">
        <DatePickerInput
          style={{ minWidth: 300 }}
          type="range"
          label={t('expenses.onetime.filter.date')}
          allowSingleDateInRange
          highlightToday
          clearable
          value={[rangeStart, rangeEnd]}
          onChange={(dateRange) => dispatch(setExpensesOneTimeDateRange(dateRange))}
        />
      </Flex>
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
        onRecordsPerPageChange={(pageSize) => dispatch(setExpensesOneTimePageSize(pageSize))}
        recordsPerPageLabel={t('pagination.itemsPerPage')}
        sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
        onSortStatusChange={(sortStatus) => dispatch(setExpensesOneTimeSortStatus(sortStatus))}
        noRecordsText={t('pagination.noRecords')}
      />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

