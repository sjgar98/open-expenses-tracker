import Layout from '../../components/Layout/Layout';
import { Flex } from '@mantine/core';
import WidgetMonthlySummary from './widgets/WidgetMonthlySummary';
import WidgetExpensesByPaymentMethod from './widgets/WidgetExpensesByPaymentMethod';
import WidgetIncomeByAccount from './widgets/WidgetIncomeByAccount';
import { useListState } from '@mantine/hooks';
import WidgetUpcomingDueDates from './widgets/WidgetUpcomingDueDates';
import { useTranslation } from 'react-i18next';
import type { WidgetProps } from '../../model/widget';
import DraggableWidget from '../../components/DraggableWidget/DraggableWidget';
import { useCallback } from 'react';

interface WidgetOption {
  id: string;
  title: string;
  Widget: React.FunctionComponent<WidgetProps>;
}

export default function Home() {
  const { t } = useTranslation();
  const widgets: WidgetOption[] = [
    { id: 'monthly-summary', title: t('home.widgets.monthlySummary.title'), Widget: WidgetMonthlySummary },
    {
      id: 'expenses-by-payment-method',
      title: t('home.widgets.expensesByPaymentMethod.title'),
      Widget: WidgetExpensesByPaymentMethod,
    },
    { id: 'income-by-account', title: t('home.widgets.incomeByAccount.title'), Widget: WidgetIncomeByAccount },
    { id: 'upcoming-due-dates', title: t('home.widgets.upcomingDueDates.title'), Widget: WidgetUpcomingDueDates },
  ];

  const [state, handlers] = useListState(widgets);

  const moveWidget = useCallback((dragIndex: number, hoverIndex: number) => {
    handlers.reorder({ from: dragIndex, to: hoverIndex });
  }, []);

  return (
    <Layout>
      <Flex
        className="flex-grow-1 py-3"
        align={'center'}
        justify={'center'}
        gap="lg"
        wrap={'wrap'}
        style={{ alignContent: 'center' }}
      >
        {state.map((widget) => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            index={state.indexOf(widget)}
            moveWidget={moveWidget}
            widget={<widget.Widget height={300} width={500} />}
          />
        ))}
      </Flex>
    </Layout>
  );
}

