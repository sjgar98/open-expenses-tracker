import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { Accordion, Box, Center, Flex, NumberFormatter, Paper, Stack, Title } from '@mantine/core';
import { DateTime } from 'luxon';
import type { CycleSource } from '../../../model/payment-methods';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import type { UpcomingDueDate, WidgetProps } from '../../../model/widget';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import OfflineUnavailable from '../../../components/OfflineUnavailable/OfflineUnavailable';
import { isUnavailableOffline, OFFLINE_LOCAL_META } from '../../../utils/offline.utils';

function formatDate(isoDate: string, source: CycleSource, t: TFunction): string {
  const formatted = DateTime.fromISO(isoDate).toLocaleString();
  return source === 'estimated' ? `${formatted} ${t('home.widgets.upcomingDueDates.estimated')}` : formatted;
}

export default function WidgetUpcomingDueDates({ height, width }: WidgetProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const {
    data: upcomingDueDates,
    fetchStatus,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['homeUpcomingDueDates'],
    queryFn: () => ApiService.getUserUpcomingDueDates(),
    placeholderData: [],
    meta: OFFLINE_LOCAL_META,
  });
  const unavailableOffline = isUnavailableOffline({ data: upcomingDueDates, fetchStatus, isPlaceholderData });

  return (
    <Paper withBorder className="p-3" h={height ?? 400} w={isMobile ? '90vw' : (width ?? 500)}>
      <Stack h="100%">
        <Center>
          <Title order={4}>{t('home.widgets.upcomingDueDates.title')}</Title>
        </Center>
        {unavailableOffline ? (
          <OfflineUnavailable compact />
        ) : (
          <Box className="flex-grow-1" style={{ overflowY: 'auto' }}>
            <Accordion w="100%" bg="var(--oet-surface)">
              {upcomingDueDates!.map((dueDate: UpcomingDueDate) => (
                <Accordion.Item key={dueDate.paymentMethod.uuid} value={dueDate.paymentMethod.uuid}>
                  <Accordion.Control>
                    <Flex justify="space-between" pe="xs">
                      <Box className="d-flex align-items-center gap-2">
                        <MaterialIcon color={dueDate.paymentMethod.iconColor} size={20}>
                          {dueDate.paymentMethod.icon}
                        </MaterialIcon>
                        <span
                          style={{
                            maxWidth: isMobile ? '100px' : 'max-content',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dueDate.paymentMethod.name}
                        </span>
                      </Box>
                      <Box>
                        <NumberFormatter
                          suffix={` ${dueDate.paymentMethod.account.currency.code}`}
                          value={dueDate.value.toFixed(2)}
                          thousandSeparator
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </Box>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack w="100%">
                      <Flex justify="space-between">
                        <Box>{t('home.widgets.upcomingDueDates.closingDate')}</Box>
                        <Box>{formatDate(dueDate.closingDate, dueDate.closingSource, t)}</Box>
                      </Flex>
                      <Flex justify="space-between">
                        <Box>{t('home.widgets.upcomingDueDates.dueDate')}</Box>
                        <Box>{formatDate(dueDate.dueDate, dueDate.dueSource, t)}</Box>
                      </Flex>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
