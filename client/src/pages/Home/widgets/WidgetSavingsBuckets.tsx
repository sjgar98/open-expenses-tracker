import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { Box, Center, Flex, NumberFormatter, Paper, Progress, Stack, Title, Tooltip } from '@mantine/core';
import MaterialIcon from '../../../components/MaterialIcon/MaterialIcon';
import type { WidgetProps } from '../../../model/widget';
import { useTranslation } from 'react-i18next';
import type { SavingsBucketWithAmounts } from '../../../model/savings-buckets';
import { DateTime } from 'luxon';

export default function WidgetSavingsBuckets({ height, width }: WidgetProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const { data: savingsBuckets } = useQuery({
    queryKey: ['homeSavingsBuckets'],
    queryFn: () => ApiService.getUserSavingsByBucket(),
    placeholderData: [],
  });

  function getProgressBarColor(bucket: SavingsBucketWithAmounts): 'red' | 'yellow' | 'cyan' | 'green' {
    if (!bucket.targetAmount) return 'green';
    const progress = bucket.amountSaved / bucket.targetAmount;
    if (progress < 0.4) return 'red';
    if (progress < 0.8) return 'yellow';
    if (progress < 1) return 'cyan';
    return 'green';
  }

  function getProgressBar(bucket: SavingsBucketWithAmounts) {
    let progressSaved: number = 0;
    let progressSpent: number = 0;
    if (bucket.amountSaved > bucket.amountSpent) {
      if (bucket.targetAmount) {
        progressSpent = Math.round((bucket.amountSpent / bucket.targetAmount) * 100);
        progressSaved = Math.round((bucket.amountSaved / bucket.targetAmount) * 100) - progressSpent;
      } else {
        progressSpent = Math.round((bucket.amountSpent / bucket.amountSaved) * 100);
        progressSaved = 100 - progressSpent;
      }
    } else {
      if (bucket.amountSpent) {
        progressSpent = 100;
      }
    }
    return (
      <Progress.Root>
        {progressSpent > 0 && (
          <Tooltip
            label={
              <>
                <span>{t('home.widgets.savingsByBucket.amountSpent')}: </span>
                <NumberFormatter
                  style={{ color: 'black' }}
                  value={bucket.amountSpent}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                />
                <span> {bucket.currency.code}</span>
              </>
            }
          >
            <Progress.Section value={progressSpent} color="white"></Progress.Section>
          </Tooltip>
        )}
        {progressSaved > 0 && (
          <Tooltip
            label={
              <>
                <span>{t('home.widgets.savingsByBucket.amountSaved')}: </span>
                <NumberFormatter
                  style={{ color: 'black' }}
                  value={bucket.amountSaved}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                />
                <span> {bucket.currency.code}</span>
              </>
            }
          >
            <Progress.Section value={progressSaved} color={getProgressBarColor(bucket)}></Progress.Section>
          </Tooltip>
        )}
      </Progress.Root>
    );
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
              <Paper withBorder shadow="xs" p="xs" key={bucket.uuid}>
                <Stack gap={4}>
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
                  <Stack gap={0}>
                    {getProgressBar(bucket)}
                    <Center>
                      <Flex gap={4}>
                        {bucket.targetAmount && (
                          <>
                            <NumberFormatter
                              value={bucket.amountSpent}
                              thousandSeparator
                              decimalScale={2}
                              fixedDecimalScale
                            />
                            <span> / </span>
                          </>
                        )}
                        <NumberFormatter
                          value={bucket.amountSaved}
                          thousandSeparator
                          decimalScale={2}
                          fixedDecimalScale
                        />
                        {bucket.targetAmount && bucket.amountSaved < bucket.targetAmount && (
                          <>
                            <span> / </span>
                            <NumberFormatter
                              value={bucket.targetAmount}
                              thousandSeparator
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </>
                        )}
                        <span> {bucket.currency.code}</span>
                      </Flex>
                    </Center>
                  </Stack>
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

