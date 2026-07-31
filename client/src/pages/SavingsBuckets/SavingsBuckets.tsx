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
import type { SavingsBucketWithAmounts } from '../../model/savings-buckets';
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

  function handleEdit(bucket: SavingsBucketWithAmounts) {
    navigate(`./edit/${bucket.uuid}`);
  }

  function getProgressBarColor(bucket: SavingsBucketWithAmounts): 'red' | 'yellow' | 'cyan' | 'green' {
    if (!bucket.targetAmount) return 'green';
    const progress = bucket.amountSaved / bucket.targetAmount;
    if (progress < 0.4) return 'red';
    if (progress < 0.8) return 'yellow';
    if (progress < 1) return 'cyan';
    return 'green';
  }

  function getProgressBar(bucket: SavingsBucketWithAmounts) {
    let progressSaved: number = 0;
    let progressSpent: number = 0;
    if (bucket.amountSaved > bucket.amountSpent) {
      if (bucket.targetAmount) {
        progressSpent = Math.round((bucket.amountSpent / bucket.targetAmount) * 100);
        progressSaved = Math.round((bucket.amountSaved / bucket.targetAmount) * 100) - progressSpent;
      } else {
        progressSpent = Math.round((bucket.amountSpent / bucket.amountSaved) * 100);
        progressSaved = 100 - progressSpent;
      }
    } else {
      if (bucket.amountSpent) {
        progressSpent = 100;
      }
    }
    return (
      <Progress.Root>
        {progressSpent > 0 && (
          <Tooltip
            label={
              <>
                <span>{t('savingsBuckets.table.labels.amountSpent')}: </span>
                <NumberFormatter
                  style={{ color: 'black' }}
                  value={bucket.amountSpent}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                />
                <span> {bucket.currency.code}</span>
              </>
            }
          >
            <Progress.Section value={progressSpent} color="white"></Progress.Section>
          </Tooltip>
        )}
        {progressSaved > 0 && (
          <Tooltip
            label={
              <>
                <span>{t('savingsBuckets.table.labels.amountSaved')}: </span>
                <NumberFormatter
                  style={{ color: 'black' }}
                  value={bucket.amountSaved}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                />
                <span> {bucket.currency.code}</span>
              </>
            }
          >
            <Progress.Section value={progressSaved} color={getProgressBarColor(bucket)}></Progress.Section>
          </Tooltip>
        )}
      </Progress.Root>
    );
  }

  const columns: DataTableColumn<SavingsBucketWithAmounts>[] = [
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
      render: (bucket) => (
        <Stack gap={0}>
          <Center>
            <Flex gap={4}>
              {bucket.targetAmount && (
                <>
                  <NumberFormatter value={bucket.amountSpent} thousandSeparator decimalScale={2} fixedDecimalScale />
                  <span> / </span>
                </>
              )}
              <NumberFormatter value={bucket.amountSaved} thousandSeparator decimalScale={2} fixedDecimalScale />
              {bucket.targetAmount && bucket.amountSaved < bucket.targetAmount && (
                <>
                  <span> / </span>
                  <NumberFormatter value={bucket.targetAmount} thousandSeparator decimalScale={2} fixedDecimalScale />
                </>
              )}
              <span> {bucket.currency.code}</span>
            </Flex>
          </Center>
          {getProgressBar(bucket)}
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

