import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import type { Account } from '../../model/accounts';
import { ApiService } from '../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout/Layout';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Box, Group, LoadingOverlay, NumberFormatter, Tooltip } from '@mantine/core';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { parseError } from '../../utils/error-parser.utils';

export default function Accounts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: accountsError, data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => ApiService.getAccounts(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [accounts]);

  useEffect(() => {
    if (accountsError) {
      enqueueSnackbar(t(parseError(accountsError) ?? 'Error'), { variant: 'error' });
    }
  }, [accountsError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(account: Account) {
    navigate(`./edit/${account.uuid}`);
  }

  const columns: DataTableColumn<Account>[] = [
    {
      accessor: 'name',
      title: t('accounts.table.header.name'),
      render: (account) => (
        <Box className="d-flex align-items-center gap-2">
          <MaterialIcon color={account.iconColor} size={20}>
            {account.icon}
          </MaterialIcon>
          <span>{account.name}</span>
        </Box>
      ),
    },
    {
      accessor: 'balance',
      title: t('accounts.table.header.balance'),
      textAlign: 'right',
      render: (account) => (
        <NumberFormatter
          suffix={` ${account.currency.code}`}
          value={account.balance}
          thousandSeparator
          decimalScale={2}
          fixedDecimalScale
        />
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
      render: (account) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(account)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={accounts} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

