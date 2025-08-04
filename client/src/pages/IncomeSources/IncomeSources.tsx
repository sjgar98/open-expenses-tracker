import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../services/api/api.service';
import { parseError } from '../../utils/error-parser.utils';
import type { IncomeSource } from '../../model/income-source';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import { ActionIcon, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import Layout from '../../components/Layout/Layout';

export default function IncomeSources() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const { error: sourcesError, data: sources } = useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => ApiService.getIncomeSources(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [sources]);

  useEffect(() => {
    if (sourcesError) {
      enqueueSnackbar(t(parseError(sourcesError) ?? 'Error'), { variant: 'error' });
    }
  }, [sourcesError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(source: IncomeSource) {
    navigate(`./edit/${source.uuid}`);
  }

  const columns: DataTableColumn<IncomeSource>[] = [
    {
      accessor: 'name',
      title: t('incomeSources.table.header.name'),
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
      render: (source) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(source)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={sources} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

