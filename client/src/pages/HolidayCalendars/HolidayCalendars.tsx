import { DataTable, type DataTableColumn } from 'mantine-datatable';
import Layout from '../../components/Layout/Layout';
import { ActionIcon, Group, LoadingOverlay, Tooltip } from '@mantine/core';
import { IconEdit, IconTablePlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { parseError } from '../../utils/error-parser.utils';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../services/api/api.service';
import type { HolidayCalendar } from '../../model/holiday-calendars';

export default function HolidayCalendars() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    error: holidayCalendarsError,
    data: holidayCalendars,
    isLoading,
  } = useQuery({
    queryKey: ['holidayCalendars'],
    queryFn: () => ApiService.getUserHolidayCalendars(),
  });

  useEffect(() => {
    if (holidayCalendarsError) {
      enqueueSnackbar(t(parseError(holidayCalendarsError) ?? 'Error'), { variant: 'error' });
    }
  }, [holidayCalendarsError]);

  const columns: DataTableColumn<HolidayCalendar>[] = [
    {
      accessor: 'name',
      title: t('holidayCalendars.table.header.name'),
      render: (calendar) => <span style={calendar.isDeleted ? { opacity: '0.5' } : {}}>{calendar.name}</span>,
    },
    {
      accessor: 'actions',
      title: (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.new')}>
            <ActionIcon variant="subtle" color="green" onClick={() => navigate('./new')}>
              <IconTablePlus />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
      render: (calendar) => (
        <Group gap={4} justify="right" wrap="nowrap">
          <Tooltip label={t('actions.edit')}>
            <ActionIcon variant="subtle" color="blue" onClick={() => navigate(`./edit/${calendar.uuid}`)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Layout>
      <DataTable withTableBorder highlightOnHover records={holidayCalendars} columns={columns} idAccessor="uuid" />
      <LoadingOverlay visible={isLoading} zIndex={1000} loaderProps={{ size: 100, color: 'green' }} />
    </Layout>
  );
}
