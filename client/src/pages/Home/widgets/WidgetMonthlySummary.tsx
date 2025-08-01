import { AreaChart } from '@mantine/charts';
import { Center, Paper, SegmentedControl, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../../../services/api/api.service';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { MOBILE_MEDIA_QUERY } from '../../../constants/media-query';

interface WidgetMonthlySummaryProps {
  height?: number;
  width?: number;
}

export default function WidgetMonthlySummary({ height, width }: WidgetMonthlySummaryProps) {
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [filterBy, setFilterBy] = useState('last3Months');
  const { data: monthlySummary } = useQuery({
    queryKey: ['homeSummary', filterBy],
    queryFn: () => ApiService.getUserSummary({ filterBy }),
    placeholderData: [],
  });

  return (
    <Paper withBorder className="p-3" h={height ?? 300} w={isMobile ? '90vw' : (width ?? 500)}>
      <Stack h="100%">
        <Center>
          <Title order={4}>Monthly Summary</Title>
        </Center>
        <Center className="flex-grow-1">
          <AreaChart
            data={monthlySummary}
            dataKey="date"
            series={[
              { name: 'Income', color: 'green' },
              { name: 'Expenses', color: 'red' },
            ]}
            withYAxis={false}
            gridAxis="y"
            valueFormatter={(value) => `USD ${value.toFixed(2)}`}
            style={{ flexGrow: 1 }}
            h="100%"
            w="100%"
          />
        </Center>
        <Center>
          <SegmentedControl
            onChange={(value) => setFilterBy(value)}
            data={[
              { label: '3m', value: 'last3Months' },
              { label: '6m', value: 'last6Months' },
              { label: '12m', value: 'last12Months' },
            ]}
          />
        </Center>
      </Stack>
    </Paper>
  );
}

