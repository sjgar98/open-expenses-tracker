import { PieChart } from '@mantine/charts';
import { Center, Paper, SegmentedControl, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';
import { useState } from 'react';
import { DateTime } from 'luxon';
import type { WidgetProps } from '../../../model/widget';
import { useTranslation } from 'react-i18next';

export default function WidgetExpensesByPaymentMethod({ height, width }: WidgetProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [rangeStart, setRangeStart] = useState<DateTime>(DateTime.now().startOf('month'));
  const [rangeEnd, setRangeEnd] = useState<DateTime>(DateTime.now().endOf('month'));
  const { data: expensesByPaymentMethod } = useQuery({
    queryKey: ['homeExpensesByPaymentMethod', rangeStart, rangeEnd],
    queryFn: () =>
      ApiService.getHomeExpensesByPaymentMethod({ rangeStart: rangeStart?.toISO()!, rangeEnd: rangeEnd?.toISO()! }),
    placeholderData: [],
  });

  const filterOptions = [
    {
      label: DateTime.now().startOf('month').minus({ months: 2 }).toFormat('MMM'),
      value: DateTime.now().startOf('month').minus({ months: 2 }).toISO(),
    },
    {
      label: DateTime.now().startOf('month').minus({ months: 1 }).toFormat('MMM'),
      value: DateTime.now().startOf('month').minus({ months: 1 }).toISO(),
    },
    { label: DateTime.now().startOf('month').toFormat('MMM'), value: DateTime.now().startOf('month').toISO() },
  ];

  function handleFilterChange(value: string) {
    setRangeStart(DateTime.fromISO(value).startOf('month'));
    setRangeEnd(DateTime.fromISO(value).endOf('month'));
  }

  return (
    <Paper withBorder className="p-3" h={height ?? 400} w={isMobile ? '90vw' : (width ?? 500)}>
      <Stack h="100%">
        <Center>
          <Title order={4}>{t('home.widgets.expensesByPaymentMethod.title')}</Title>
        </Center>
        <Center className="flex-grow-1">
          <PieChart
            h="100%"
            w="100%"
            style={{ zIndex: 10 }}
            data={expensesByPaymentMethod}
            withTooltip
            tooltipProps={{ wrapperStyle: { width: 'max-content' } }}
            valueFormatter={(value) => `USD ${value.toFixed(2)}`}
            withLabels
            withLabelsLine
            labelsPosition="outside"
            labelsType="percent"
          />
        </Center>
        <Center>
          <SegmentedControl
            defaultValue={filterOptions[filterOptions.length - 1].value}
            onChange={(value) => handleFilterChange(value)}
            data={filterOptions}
          />
        </Center>
      </Stack>
    </Paper>
  );
}

