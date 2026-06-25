import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../services/api/api.service';
import { ActionIcon, Box, Center, Flex, Group, LoadingOverlay, NumberFormatter, Progress, Stack, Tooltip, } from '@mantine/core';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import Layout from '../../components/Layout/Layout';
import { parseError } from '../../utils/error-parser.utils';
import type { SavingsBucketWithCurrent } from '../../model/savings-buckets';
import { DateTime } from 'luxon';

export default function SavingsBuckets() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: bucketsError, data: buckets } = useQuery({
    queryKey: ['savingsBuckets'],
    queryFn: () => ApiService.getSavingsBuckets(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [buckets]);

  useEffect(() => {
    if (bucketsError) {
      enqueueSnackbar(t(parseError(bucketsError) ?? 'Error'), { variant: 'error' });
    }
  }, [bucketsError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(bucket: SavingsBucketWithCurrent) {
    navigate(`./edit/${bucket.uuid}`);
  }

  function getProgressBarColor(bucket: SavingsBucketWithCurrent): 'red' | 'yellow' | 'cyan' | 'green' {
    if (!bucket.targetAmount) return 'green';
    const progress = bucket.currentAmount / bucket.targetAmount;
    if (progress < 0.4) return 'red';
    if (progress < 0.8) return 'yellow';
    if (progress < 1) return 'cyan';
    return 'green';
  }

  const columns: DataTableColumn<SavingsBucketWithCurrent>[] = [
    {
      accessor: 'name',
      title: t('savingsBuckets.table.header.name'),
      render: (bucket) => (
        <Box className="d-flex align-items-center gap-2">
          <MaterialIcon color={bucket.iconColor} size={20}>
            {bucket.icon}
          </MaterialIcon>
          <span style={bucket.isDeleted ? { opacity: '0.5' } : {}}>{bucket.name}</span>
        </Box>
      ),
    },
    {
      accessor: 'targetAmount',
      title: t('savingsBuckets.table.header.targetAmount'),
      render: (bucket) =>
        bucket.targetAmount ? (
          <Stack gap={0}>
            <Center>
              <Flex gap={4}>
                <NumberFormatter value={bucket.currentAmount} thousandSeparator decimalScale={2} fixedDecimalScale />
                <span> / </span>
                <NumberFormatter value={bucket.targetAmount} thousandSeparator decimalScale={2} fixedDecimalScale />
                <span> {bucket.currency.code}</span>
              </Flex>
            </Center>
            <Progress value={(bucket.currentAmount / bucket.targetAmount) * 100} color={getProgressBarColor(bucket)} />
          </Stack>
        ) : (
          <Stack gap={0}>
            <Center>
              <Flex gap={4}>
                <NumberFormatter value={bucket.currentAmount} thousandSeparator decimalScale={2} fixedDecimalScale />
                <span> / </span>
                <span>&infin;</span>
                <span> {bucket.currency.code}</span>
              </Flex>
            </Center>
            <Progress value={100} color={getProgressBarColor(bucket)} />
          </Stack>
        ),
    },
    {
      accessor: 'deadline',
      title: t('savingsBuckets.table.header.deadline'),
      render: (bucket) => (
        <span style={bucket.isDeleted ? { opacity: '0.5' } : {}}>
          {bucket.deadline ? DateTime.fromISO(bucket.deadline).toLocaleString() : '-'}
        </span>
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
      render: (bucket) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(bucket)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={buckets} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

