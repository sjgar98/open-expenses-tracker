import { Pagination, Stack, Text } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface OfflineListPageProps {
  page: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function OfflineListPage({ page, totalRecords, recordsPerPage, onPageChange }: OfflineListPageProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(page, Math.ceil(totalRecords / recordsPerPage));
  return (
    <Stack align="center" gap="xs" p="md" ta="center" c="dimmed">
      <IconCloudOff size={40} stroke={1.5} />
      <Text size="sm">{t('offline.pageUnavailable')}</Text>
      <Pagination size="sm" value={page} total={totalPages} onChange={onPageChange} style={{ pointerEvents: 'auto' }} />
    </Stack>
  );
}
