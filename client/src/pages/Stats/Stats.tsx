import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout/Layout';
import { Center, Flex, Paper, Stack, Title } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { DateTime } from 'luxon';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../constants/media-query';
import { PieChart } from '@mantine/charts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiService } from '../../services/api/api.service';

export default function Stats() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [rangeStart, setRangeStart] = useState<string | null>(DateTime.now().startOf('month').toFormat('yyyy-MM-dd'));
  const [rangeEnd, setRangeEnd] = useState<string | null>(DateTime.now().endOf('month').toFormat('yyyy-MM-dd'));

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

  function handleDateRangeChange(dateRange: DatesRangeValue<string>) {
    const [start, end] = dateRange;
    setRangeStart(start);
    setRangeEnd(end);
  }

  return (
    <Layout>
      <Flex justify={'center'} p={8} my={20}>
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
      <Stack align="center" my={20}>
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

