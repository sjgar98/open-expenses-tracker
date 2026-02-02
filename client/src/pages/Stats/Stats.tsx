import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import { Center, Flex, Paper, Stack, Title } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { DateTime, Interval } from 'luxon';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import { Heatmap, PieChart } from '@mantine/charts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiService } from '../../services/api/api.service';

export default function Stats() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [rangeStart, setRangeStart] = useState<string | null>(DateTime.now().startOf('month').toFormat('yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState<string | null>(DateTime.now().endOf('month').toFormat('yyyy-MM-dd'));
  const [heatmapRange, setHeatmapRange] = useState<{ rangeStart: string; rangeEnd: string }[]>(
    getHeatmapRanges(rangeStart, rangeEnd)
  );

  const { data: expensesHeatmap } = useQuery({
    queryKey: ['expensesHeatmap', rangeStart, rangeEnd],
    queryFn: () => ApiService.getHomeExpensesHeatmap({ rangeStart: rangeStart!, rangeEnd: rangeEnd! }),
    placeholderData: { displayCurrency: 'USD', data: {} },
    enabled: Boolean(rangeStart && rangeEnd),
  });
  const { data: expensesByCategory } = useQuery({
    queryKey: ['homeExpensesByCategory', rangeStart, rangeEnd],
    queryFn: () => ApiService.getHomeExpensesByCategory({ rangeStart: rangeStart!, rangeEnd: rangeEnd! }),
    placeholderData: { displayCurrency: 'USD', data: [] },
    enabled: Boolean(rangeStart && rangeEnd),
  });
  const { data: expensesByPaymentMethod } = useQuery({
    queryKey: ['homeExpensesByPaymentMethod', rangeStart, rangeEnd],
    queryFn: () => ApiService.getHomeExpensesByPaymentMethod({ rangeStart: rangeStart!, rangeEnd: rangeEnd! }),
    placeholderData: { displayCurrency: 'USD', data: [] },
    enabled: Boolean(rangeStart && rangeEnd),
  });

  useEffect(() => {
    setHeatmapRange(getHeatmapRanges(rangeStart, rangeEnd));
  }, [isMobile, rangeStart, rangeEnd]);

  function getHeatmapRanges(
    rangeStart: string | null,
    rangeEnd: string | null
  ): { rangeStart: string; rangeEnd: string }[] {
    if (!rangeStart || !rangeEnd) return [];
    const MAX_MONTHS_PER_ROW = isMobile ? 3 : 8;
    const fullRangeInterval = Interval.fromDateTimes(
      DateTime.fromFormat(rangeStart, 'yyyy-MM-dd').startOf('month'),
      DateTime.fromFormat(rangeEnd, 'yyyy-MM-dd').endOf('month')
    );
    const intervalChunks = fullRangeInterval
      .splitBy({ months: MAX_MONTHS_PER_ROW })
      .map((interval, _, a) => ({
        rangeStart: interval.start!,
        rangeEnd: interval.end!.minus({ days: a.at(-1) === interval ? 0 : 1 }),
      }))
      .map((range) => ({
        rangeStart: range.rangeStart.toFormat('yyyy-MM-dd'),
        rangeEnd: range.rangeEnd.toFormat('yyyy-MM-dd'),
      }));
    return intervalChunks;
  }

  function handleDateRangeChange(dateRange: DatesRangeValue<string>) {
    const [start, end] = dateRange;
    setRangeStart(start);
    setRangeEnd(end);
  }

  return (
    <Layout>
      <Flex justify={'center'} p={8} my={10}>
        <DatePickerInput
          style={{ minWidth: 300 }}
          type="range"
          label={t('stats.filters.date')}
          allowSingleDateInRange
          highlightToday
          clearable
          value={[rangeStart, rangeEnd]}
          onChange={(dateRange) => handleDateRangeChange(dateRange)}
          valueFormat="YYYY-MM-DD"
          presets={[
            {
              label: t('datepicker.presets.thisMonth'),
              value: [
                DateTime.now().startOf('month').toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('month').toFormat('yyyy-MM-dd'),
              ],
            },
            {
              label: t('datepicker.presets.thisYear'),
              value: [
                DateTime.now().startOf('year').toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('year').toFormat('yyyy-MM-dd'),
              ],
            },
            {
              label: t('datepicker.presets.lastYear'),
              value: [
                DateTime.now().startOf('year').minus({ years: 1 }).toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('year').minus({ years: 1 }).toFormat('yyyy-MM-dd'),
              ],
            },
            {
              label: t('datepicker.presets.last3Months'),
              value: [
                DateTime.now().startOf('month').minus({ months: 2 }).toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('month').toFormat('yyyy-MM-dd'),
              ],
            },
            {
              label: t('datepicker.presets.last6Months'),
              value: [
                DateTime.now().startOf('month').minus({ months: 5 }).toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('month').toFormat('yyyy-MM-dd'),
              ],
            },
            {
              label: t('datepicker.presets.last12Months'),
              value: [
                DateTime.now().startOf('month').minus({ months: 11 }).toFormat('yyyy-MM-dd'),
                DateTime.now().endOf('month').toFormat('yyyy-MM-dd'),
              ],
            },
          ]}
        />
      </Flex>
      <Stack align="center" mt={10} mb={20}>
        <Paper withBorder className="p-3 pb-4" mih={isMobile ? 200 : 250} w={isMobile ? '90vw' : 1000}>
          <Stack h="100%">
            <Center>
              <Title order={4}>{t('home.widgets.expensesHeatmap.title')}</Title>
            </Center>
            {heatmapRange.map((range) => (
              <Center className="flex-grow-1">
                <Heatmap
                  style={{ zIndex: 10 }}
                  data={expensesHeatmap!.data}
                  startDate={range.rangeStart}
                  endDate={range.rangeEnd}
                  withOutsideDates={false}
                  withTooltip
                  withWeekdayLabels
                  withMonthLabels
                  splitMonths
                  rectSize={isMobile ? 10 : 15}
                  getTooltipLabel={({ date, value }) =>
                    value
                      ? `${DateTime.fromFormat(date, 'yyyy-MM-dd').toLocaleString()} - ${expensesHeatmap!.displayCurrency} ${value}`
                      : ''
                  }
                />
              </Center>
            ))}
          </Stack>
        </Paper>
        <Paper withBorder className="p-3" h={400} w={isMobile ? '90vw' : 1000}>
          <Stack h="100%">
            <Center>
              <Title order={4}>{t('home.widgets.expensesByCategory.title')}</Title>
            </Center>
            <Center className="flex-grow-1">
              <PieChart
                h="100%"
                w="100%"
                style={{ zIndex: 10 }}
                data={expensesByCategory!.data}
                withTooltip
                tooltipProps={{ wrapperStyle: { width: 'max-content' } }}
                valueFormatter={(value) => `${expensesByCategory!.displayCurrency} ${value.toFixed(2)}`}
                withLabels
                withLabelsLine
                labelsPosition="outside"
                labelsType="percent"
              />
            </Center>
          </Stack>
        </Paper>
        <Paper withBorder className="p-3" h={400} w={isMobile ? '90vw' : 1000}>
          <Stack h="100%">
            <Center>
              <Title order={4}>{t('home.widgets.expensesByPaymentMethod.title')}</Title>
            </Center>
            <Center className="flex-grow-1">
              <PieChart
                h="100%"
                w="100%"
                style={{ zIndex: 10 }}
                data={expensesByPaymentMethod!.data}
                withTooltip
                tooltipProps={{ wrapperStyle: { width: 'max-content' } }}
                valueFormatter={(value) => `${expensesByPaymentMethod!.displayCurrency} ${value.toFixed(2)}`}
                withLabels
                withLabelsLine
                labelsPosition="outside"
                labelsType="percent"
              />
            </Center>
          </Stack>
        </Paper>
      </Stack>
    </Layout>
  );
}

