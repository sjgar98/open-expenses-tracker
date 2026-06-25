import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../services/api/api.service';
import { enqueueSnackbar } from 'notistack';
import { parseError } from '../../utils/error-parser.utils';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { DateTime } from 'luxon';
import { ActionIcon, Box, Drawer, Flex, Group, LoadingOverlay, NumberFormatter, Select, Stack, TextInput, Tooltip, } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus, IconFilter } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../model/state';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useElementSizeWithRef } from '../../utils/use-element-size.hook';
import type { Saving } from '../../model/savings';
import { setSavingsBucket, setSavingsDateRange, setSavingsSearchTerm, setSavingsSortStatus, } from '../../services/store/slices/savingsSlice';
import Layout from '../../components/Layout/Layout';

export default function Savings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [isLoading, setIsLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const { sortBy, sortOrder, rangeStart, rangeEnd, bucket, searchTerm } = useSelector(
    ({ savings }: AppState) => savings
  );
  const { ref, height } = useElementSizeWithRef<HTMLDivElement>();

  const { data: filterBuckets } = useQuery({
    queryKey: ['savings', 'filterBuckets'],
    queryFn: () => ApiService.getUserSavingsBucketsFilter(),
  });

  const { error, data, refetch } = useQuery({
    queryKey: ['savings'],
    queryFn: () =>
      ApiService.getUserSavings({ page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd, bucket, searchTerm }),
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
      setPageSize(AUTO_PAGE_SIZE);
    }
  }, [height]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd, bucket, searchTerm]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(saving: Saving) {
    navigate(`./edit/${saving.uuid}`);
  }

  const columns: DataTableColumn<Saving>[] = [
    {
      accessor: 'date',
      title: t('savings.table.header.date'),
      sortable: true,
      width: 100,
      render: (saving) => DateTime.fromISO(saving.date).toLocaleString(),
    },
    {
      accessor: 'description',
      title: t('savings.table.header.description'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
    },
    {
      accessor: 'amount',
      title: t('savings.table.header.amount'),
      textAlign: 'right',
      width: !isMobile ? 200 : undefined,
      render: (saving) => (
        <NumberFormatter
          suffix={` ${saving.currency.code}`}
          value={saving.amount}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    {
      accessor: 'bucket',
      title: t('savings.table.header.bucket'),
      visibleMediaQuery: DESKTOP_MEDIA_QUERY,
      width: 300,
      render: (saving) =>
        saving.bucket && (
          <Box className="d-flex align-items-center gap-2">
            <MaterialIcon color={saving.bucket.iconColor} size={24}>
              {saving.bucket.icon}
            </MaterialIcon>
            <span>{saving.bucket.name}</span>
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
      render: (saving) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(saving)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <>
      <Layout>
        <div className="container-fluid p-0">
          <div className="row m-0">
            <div className="col-12 col-md-auto p-0 align-content-center">
              <Flex className="m-2" gap={8} align="center">
                <Tooltip label={t('actions.filter')}>
                  <ActionIcon size={isMobile ? undefined : 'lg'} variant="subtle" color="blue" onClick={() => open()}>
                    <IconFilter />
                  </ActionIcon>
                </Tooltip>
                <TextInput
                  style={{ flexGrow: '1' }}
                  placeholder={t('savings.filter.searchTerm')}
                  value={searchTerm}
                  onChange={(event) => dispatch(setSavingsSearchTerm(event.currentTarget.value))}
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
          sortStatus={{ columnAccessor: sortBy, direction: sortOrder }}
          onSortStatusChange={(sortStatus) => dispatch(setSavingsSortStatus(sortStatus))}
          noRecordsText={t('pagination.noRecords')}
        />
        <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
        <Drawer.Root opened={opened} onClose={close} position="right">
          <Drawer.Overlay />
          <Drawer.Content>
            <Box w="100%" h="100%" display="flex" style={{ flexDirection: 'column' }}>
              <Drawer.Header>
                <Drawer.Title>{t('savings.filter.title')}</Drawer.Title>
                <Drawer.CloseButton />
              </Drawer.Header>
              <Drawer.Body style={{ flexGrow: '1' }}>
                <Stack h="100%" gap={16}>
                  <DatePickerInput
                    type="range"
                    dropdownType={isMobile ? 'modal' : 'popover'}
                    label={t('savings.filter.date')}
                    allowSingleDateInRange
                    highlightToday
                    clearable
                    value={[rangeStart, rangeEnd]}
                    onChange={(dateRange) => dispatch(setSavingsDateRange(dateRange))}
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
                    size={isMobile ? 'xs' : undefined}
                  />
                  <Select
                    label={t('savings.filter.bucket')}
                    value={bucket}
                    onChange={(value) => dispatch(setSavingsBucket(value))}
                    clearable
                    data={filterBuckets?.map((bucket) => ({
                      value: bucket.uuid,
                      label: bucket.name,
                    }))}
                    renderOption={(item) => {
                      const option = filterBuckets!.find((filterBuckets) => filterBuckets.uuid === item.option.value)!;
                      return (
                        <Box className="d-flex align-items-center gap-1">
                          <MaterialIcon color={option.iconColor} size={20}>
                            {option.icon}
                          </MaterialIcon>
                          <span>{option.name}</span>
                        </Box>
                      );
                    }}
                    size={isMobile ? 'xs' : undefined}
                  />
                </Stack>
              </Drawer.Body>
            </Box>
          </Drawer.Content>
        </Drawer.Root>
      </Layout>
    </>
  );
}

