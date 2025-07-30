import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../../services/api/api.service';
import { enqueueSnackbar } from 'notistack';
import { parseError } from '../../../utils/error-parser.utils';
import type { Income } from '../../../model/income';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Box, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';

export default function IncomeOneTime() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const { error: incomeOneTimeError, data: incomeOneTimeResponse } = useQuery({
    queryKey: ['incomeOneTime'],
    queryFn: () => ApiService.getUserIncome(),
  });

  useEffect(() => {
    if (incomeOneTimeResponse) {
      setIsLoading(false);
    }
  }, [incomeOneTimeResponse]);

  useEffect(() => {
    if (incomeOneTimeError) {
      enqueueSnackbar(t(parseError(incomeOneTimeError) ?? 'Error'), { variant: 'error' });
    }
  }, [incomeOneTimeError]);

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
      <DataTable withTableBorder highlightOnHover records={incomeOneTimeResponse} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

