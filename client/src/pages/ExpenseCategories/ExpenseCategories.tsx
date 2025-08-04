import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ApiService } from '../../services/api/api.service';
import { ActionIcon, Box, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import MaterialIcon from '../../components/MaterialIcon/MaterialIcon';
import { DataTable, type DataTableColumn } from 'mantine-datatable';
import type { ExpenseCategory } from '../../model/expense-categories';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import Layout from '../../components/Layout/Layout';
import { parseError } from '../../utils/error-parser.utils';

export default function ExpenseCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);

  const { error: categoriesError, data: categories } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => ApiService.getExpenseCategories(),
  });

  useEffect(() => {
    setIsLoading(false);
  }, [categories]);

  useEffect(() => {
    if (categoriesError) {
      enqueueSnackbar(t(parseError(categoriesError) ?? 'Error'), { variant: 'error' });
    }
  }, [categoriesError]);

  function handleAdd() {
    navigate('./new');
  }

  function handleEdit(category: ExpenseCategory) {
    navigate(`./edit/${category.uuid}`);
  }

  const columns: DataTableColumn<ExpenseCategory>[] = [
    {
      accessor: 'name',
      title: t('expenseCategories.table.header.name'),
      render: (category) => (
        <Box className="d-flex align-items-center gap-2">
          <MaterialIcon color={category.iconColor} size={20}>
            {category.icon}
          </MaterialIcon>
          <span>{category.name}</span>
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
      render: (category) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(category)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={categories} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}

