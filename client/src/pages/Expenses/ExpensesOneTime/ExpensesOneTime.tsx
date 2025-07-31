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
import { ActionIcon, Box, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import { DESKTOP_MEDIA_QUERY } from '../../../constants/media-query';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';

export default function ExpensesOneTime() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const { error: expensesOneTimeError, data: expensesOneTimeResponse } = useQuery({
    queryKey: ['expensesOneTime'],
    queryFn: () => ApiService.getUserExpenses(),
  });

  useEffect(() => {
    if (expensesOneTimeResponse) {
      setIsLoading(false);
    }
  }, [expensesOneTimeResponse]);

  useEffect(() => {
    if (expensesOneTimeError) {
      enqueueSnackbar(t(parseError(expensesOneTimeError) ?? 'Error'), { variant: 'error' });
    }
  }, [expensesOneTimeError]);

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
      <DataTable
        withTableBorder
        highlightOnHover
        records={expensesOneTimeResponse}
        columns={columns}
        idAccessor="uuid"
      />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </>
  );
}

