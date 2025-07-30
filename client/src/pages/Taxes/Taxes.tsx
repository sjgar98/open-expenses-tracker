import { DataTable, type DataTableColumn } from 'mantine-datatable';
import Layout from '../../components/Layout/Layout';
import { ActionIcon, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { parseError } from '../../utils/error-parser.utils';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../services/api/api.service';
import type { Tax } from '../../model/taxes';

export default function Taxes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: taxesError, data: taxes } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => ApiService.getUserTaxes(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [taxes]);

  useEffect(() => {
    if (taxesError) {
      enqueueSnackbar(t(parseError(taxesError) ?? 'Error'), { variant: 'error' });
    }
  }, [taxesError]);

  const handleAdd = () => {
    navigate('./new');
  };

  const handleEdit = (tax: Tax) => {
    navigate(`./edit/${tax.uuid}`);
  };

  const columns: DataTableColumn<Tax>[] = [
    {
      accessor: 'name',
      title: t('taxes.table.header.name'),
      render: (tax) => <span>{tax.name}</span>,
    },
    {
      accessor: 'rate',
      title: t('taxes.table.header.rate'),
      render: (tax) => `${tax.rate}%`,
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
      render: (tax) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(tax)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={taxes} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

