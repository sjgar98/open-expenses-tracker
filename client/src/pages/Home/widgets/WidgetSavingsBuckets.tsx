import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { Box, Center, Flex, NumberFormatter, Paper, Progress, Stack, Title } from '@mantine/core';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import type { WidgetProps } from '../../../model/widget';
import { useTranslation } from 'react-i18next';
import type { SavingsBucketWithCurrent } from '../../../model/savings-buckets';
import { DateTime } from 'luxon';

export default function WidgetSavingsBuckets({ height, width }: WidgetProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const { data: savingsBuckets } = useQuery({
    queryKey: ['homeSavingsBuckets'],
    queryFn: () => ApiService.getUserSavingsByBucket(),
    placeholderData: [],
  });

  function getProgressBarColor(bucket: SavingsBucketWithCurrent): 'red' | 'yellow' | 'cyan' | 'green' {
    if (!bucket.targetAmount) return 'green';
    const progress = bucket.currentAmount / bucket.targetAmount;
    if (progress < 0.4) return 'red';
    if (progress < 0.8) return 'yellow';
    if (progress < 1) return 'cyan';
    return 'green';
  }

  return (
    <Paper withBorder className="p-3" h={height ?? 400} w={isMobile ? '90vw' : (width ?? 500)}>
      <Stack h="100%">
        <Center>
          <Title order={4}>{t('home.widgets.savingsByBucket.title')}</Title>
        </Center>
        <Box className="flex-grow-1" style={{ overflowY: 'auto' }}>
          <Stack>
            {savingsBuckets!.map((bucket) => (
              <Paper withBorder shadow="xs" p="xs">
                <Stack key={bucket.uuid} gap={4}>
                  <Flex justify="space-between">
                    <Box className="d-flex align-items-center gap-2">
                      <MaterialIcon color={bucket.iconColor} size={20}>
                        {bucket.icon}
                      </MaterialIcon>
                      <span
                        style={{
                          maxWidth: isMobile ? '100px' : 'max-content',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {bucket.name}
                      </span>
                    </Box>
                    <Box>
                      <span style={bucket.isDeleted ? { opacity: '0.5' } : {}}>
                        {bucket.deadline ? DateTime.fromISO(bucket.deadline).toLocaleString() : ''}
                      </span>
                    </Box>
                  </Flex>
                  {bucket.targetAmount ? (
                    <Stack gap={0}>
                      <Progress
                        value={(bucket.currentAmount / bucket.targetAmount) * 100}
                        color={getProgressBarColor(bucket)}
                      />
                      <Center>
                        <Flex gap={4}>
                          <NumberFormatter
                            value={bucket.currentAmount}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          <span> / </span>
                          <NumberFormatter
                            value={bucket.targetAmount}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          <span> {bucket.currency.code}</span>
                        </Flex>
                      </Center>
                    </Stack>
                  ) : (
                    <Stack gap={0}>
                      <Progress value={100} color={getProgressBarColor(bucket)} />
                      <Center>
                        <Flex gap={4}>
                          <NumberFormatter
                            value={bucket.currentAmount}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          <span> / </span>
                          <span>&infin;</span>
                          <span> {bucket.currency.code}</span>
                        </Flex>
                      </Center>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
          {/* <Accordion w="100%" bg="dark">
            {savingsBuckets!.map((bucket) => (
              <Accordion.Item key={bucket.uuid} value={bucket.uuid}>
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
                      <Box>{DateTime.fromISO(dueDate.closingDate).toLocaleString()}</Box>
                    </Flex>
                    <Flex justify="space-between">
                      <Box>{t('home.widgets.upcomingDueDates.dueDate')}</Box>
                      <Box>{DateTime.fromISO(dueDate.dueDate).toLocaleString()}</Box>
                    </Flex>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
   */}
        </Box>
      </Stack>
    </Paper>
  );
}

