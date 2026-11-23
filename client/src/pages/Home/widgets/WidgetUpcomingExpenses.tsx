import { useTranslation } from 'react-i18next';
import type { WidgetProps } from '../../../model/widget';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import { Center, Flex, Paper, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { ApiService } from '../../../services/api/api.service';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import OfflineUnavailable from '../../../components/OfflineUnavailable/OfflineUnavailable';
import { isUnavailableOffline, OFFLINE_LOCAL_META } from '../../../utils/offline.utils';

export default function WidgetUpcomingExpenses({ height, width }: WidgetProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [filterBy, setFilterBy] = useState('oneDay');
  const {
    data: upcomingExpenses,
    fetchStatus,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['homeUpcomingExpenses', filterBy],
    queryFn: () => ApiService.getUserUpcomingExpenses(filterBy),
    placeholderData: [],
    meta: OFFLINE_LOCAL_META,
  });
  const unavailableOffline = isUnavailableOffline({ data: upcomingExpenses, fetchStatus, isPlaceholderData });

  return (
    <Paper withBorder className="p-3" h={height ?? 400} w={isMobile ? '90vw' : (width ?? 500)}>
      <Stack h="100%">
        <Center>
          <Title order={4}>{t('home.widgets.upcomingExpenses.title')}</Title>
        </Center>
        {unavailableOffline ? (
          <OfflineUnavailable compact />
        ) : (
          <Stack className="flex-grow-1" style={{ overflowY: 'auto' }} gap="xs">
            {upcomingExpenses!.map((expense) => (
              <Flex key={expense.uuid} bg="var(--oet-surface)" p="xs" justify="space-between">
                <Text>{expense.description}</Text>
                <Text>{DateTime.fromISO(expense.nextOccurrence!).toLocaleString()}</Text>
              </Flex>
            ))}
          </Stack>
        )}
        <Center>
          <SegmentedControl
            value={filterBy}
            onChange={(value) => setFilterBy(value)}
            data={[
              { label: '7d', value: 'sevenDays' },
              { label: '3d', value: 'threeDays' },
              { label: '1d', value: 'oneDay' },
            ]}
          />
        </Center>
      </Stack>
    </Paper>
  );
}
