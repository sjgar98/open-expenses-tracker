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
import { ActionIcon, Box, Flex, Group, LoadingOverlay, NumberFormatter, Select, Switch, Tooltip } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';
import { setExpensesOneTimeAutoSize, setExpensesOneTimeCategories, setExpensesOneTimeDateRange, setExpensesOneTimePageSize, setExpensesOneTimeSortStatus, } from '../../../services/store/slices/expensesSlice';
import { useElementSize, useMediaQuery } from '@mantine/hooks';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../model/pagination';

export default function ExpensesOneTime() {
  const [pageSizeOptions, setPageSizeOptions] = useState<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { pageSize, sortBy, sortOrder, rangeStart, rangeEnd, category, autoSize } = useSelector(
    ({ expenses }: AppState) => expenses.oneTime
  );
  const { ref, height } = useElementSize();

  const { data: filterCategories } = useQuery({
    queryKey: ['expensesOneTime', 'filterCategories'],
    queryFn: () => ApiService.getUserExpensesCategoriesFilter(),
  });

  const { error, data, refetch } = useQuery({
    queryKey: ['expensesOneTime'],
    queryFn: () => ApiService.getUserExpenses({ page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd, category }),
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
    if (height > 0) {
      const AUTO_PAGE_SIZE = Math.floor((height - 43) / 43);
      if (!DEFAULT_PAGE_SIZE_OPTIONS.includes(AUTO_PAGE_SIZE)) {
        setPageSizeOptions([...DEFAULT_PAGE_SIZE_OPTIONS, AUTO_PAGE_SIZE].sort((a, b) => a - b));
      }
      if (autoSize && AUTO_PAGE_SIZE !== pageSize) {
        dispatch(setExpensesOneTimePageSize(AUTO_PAGE_SIZE));
        // setTimeout(() => {
        //   refetch();
        // }, 100);
      }
    }
  }, [height, autoSize]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd, category]);

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
      width: 100,
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
      width: !isMobile ? 200 : undefined,
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
      width: !isMobile ? 200 : undefined,
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
      width: 300,
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
      width: 300,
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
      width: 50,
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
      <div className="container-fluid p-0">
        <div className="row m-0">
          <div className="col-12 col-md-auto p-0 align-content-center">
            <Flex className="m-2" gap={8}>
              <DatePickerInput
                style={{ width: 210 }}
                type="range"
                label={t('expenses.onetime.filter.date')}
                allowSingleDateInRange
                highlightToday
                clearable
                value={[rangeStart, rangeEnd]}
                onChange={(dateRange) => dispatch(setExpensesOneTimeDateRange(dateRange))}
                valueFormat="YYYY-MM-DD"
                presets={[
                  {
                    label: t('datepicker.presets.thisMonth'),
                    value: [
                      DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                      DateTime.now().endOf('month').toFormat('yyyy-MM-dd'),
                    ],
                  },
                ]}
              />
              <Select
                style={{ width: 210 }}
                label={t('expenses.onetime.filter.category')}
                value={category}
                onChange={(value) => dispatch(setExpensesOneTimeCategories(value))}
                clearable
                data={filterCategories?.map((category) => ({
                  value: category.uuid,
                  label: category.name,
                }))}
                renderOption={(item) => {
                  const option = filterCategories!.find(
                    (filterCategories) => filterCategories.uuid === item.option.value
                  )!;
                  return (
                    <Box className="d-flex align-items-center gap-1">
                      <MaterialIcon color={option.iconColor} size={20}>
                        {option.icon}
                      </MaterialIcon>
                      <span>{option.name}</span>
                    </Box>
                  );
                }}
              />
            </Flex>
          </div>
          <div className="col-12 col-md-auto p-0 align-content-center">
            <Flex className="m-2" gap={8}>
              <Switch
                style={{ width: 210 }}
                label={t('expenses.onetime.filter.autoSize')}
                value={autoSize ? 'on' : 'off'}
                onChange={(event) => dispatch(setExpensesOneTimeAutoSize(event.currentTarget.checked))}
                defaultChecked={autoSize}
              />
            </Flex>
          </div>
        </div>
      </div>
      <DataTable
        scrollViewportRef={ref}
        withTableBorder
        highlightOnHover
        records={data?.items}
        columns={columns}
        idAccessor="uuid"
        totalRecords={data?.totalCount || 0}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={pageSizeOptions}
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

