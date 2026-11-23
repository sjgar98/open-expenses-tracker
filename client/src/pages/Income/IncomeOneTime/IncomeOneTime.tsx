import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../../services/api/api.service';
import { enqueueSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import type { Income } from '../../../model/income';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isUnavailableOffline, OFFLINE_LOCAL_META } from '../../../utils/offline.utils';
import OfflineListPage from '../../../components/OfflineListPage/OfflineListPage';
import { DateTime } from 'luxon';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Box, Flex, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';
import { DatePickerInput } from '@mantine/dates';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../model/state';
import { setIncomeOneTimeDateRange, setIncomeOneTimeSortStatus } from '../../../services/store/slices/incomeSlice';
import { useElementSizeWithRef } from '../../../utils/use-element-size.hook';
import { useAutoPageSize } from '../../../utils/use-auto-page-size.hook';

export default function IncomeOneTime() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { sortBy, sortOrder, rangeStart, rangeEnd } = useSelector(({ income }: AppState) => income.oneTime);
  const { ref, height } = useElementSizeWithRef<HTMLDivElement>();
  const pageSize = useAutoPageSize(height, 'incomeOneTime');

  const { error, data, fetchStatus, isPlaceholderData } = useQuery({
    queryKey: ['incomeOneTime', { page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd }],
    queryFn: () => ApiService.getUserIncome({ page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd }),
    placeholderData: keepPreviousData,
    meta: OFFLINE_LOCAL_META,
  });
  const unavailableOffline = isUnavailableOffline({ data, fetchStatus, isPlaceholderData });

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

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(income: Income) {
    navigate(`./edit/${income.uuid}`);
  }

  const columns: DataTableColumn<Income>[] = [
    {
      accessor: 'date',
      title: t('income.onetime.table.header.date'),
      sortable: true,
      render: (income) => DateTime.fromISO(income.date).toLocaleString(),
    },
    { accessor: 'description', title: t('income.onetime.table.header.description') },
    {
      accessor: 'amount',
      title: t('income.onetime.table.header.amount'),
      textAlign: 'right',
      render: (income) => (
        <NumberFormatter
          suffix={` ${income.currency.code}`}
          value={income.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'account',
      title: t('income.onetime.table.header.account'),
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
      accessor: 'source',
      title: t('income.onetime.table.header.source'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      render: (income) => income.source && income.source.name,
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
      render: (income) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(income)}>
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
          label={t('income.onetime.filter.date')}
          allowSingleDateInRange
          highlightToday
          clearable
          value={[rangeStart, rangeEnd]}
          onChange={(dateRange) => dispatch(setIncomeOneTimeDateRange(dateRange))}
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
      </Flex>
      <DataTable
        scrollViewportRef={ref}
        withTableBorder
        highlightOnHover
        records={unavailableOffline ? [] : data?.items}
        columns={columns}
        idAccessor="uuid"
        totalRecords={data?.totalCount || 0}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
        onSortStatusChange={(sortStatus) => dispatch(setIncomeOneTimeSortStatus(sortStatus))}
        {...(unavailableOffline
          ? {
              emptyState: (
                <OfflineListPage
                  page={page}
                  totalRecords={data?.totalCount || 0}
                  recordsPerPage={pageSize}
                  onPageChange={setPage}
                />
              ),
            }
          : { noRecordsText: t('pagination.noRecords') })}
      />
      <LoadingOverlay
        visible={isLoading && !unavailableOffline}
        zIndex={1000}
        loaderProps={{ size: 100, color: 'green' }}
      />
    </>
  );
}
