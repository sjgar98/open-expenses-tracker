import Layout from '../../components/Layout/Layout';
import { Flex } from '@mantine/core';
import WidgetMonthlySummary from './widgets/WidgetMonthlySummary';
import WidgetExpensesByPaymentMethod from './widgets/WidgetExpensesByPaymentMethod';
import WidgetIncomeByAccount from './widgets/WidgetIncomeByAccount';
import { useListState } from '@mantine/hooks';
import WidgetUpcomingDueDates from './widgets/WidgetUpcomingDueDates';
import { useTranslation } from 'react-i18next';

interface WidgetOption {
  id: string;
  title: string;
  Widget: React.FunctionComponent;
}

export default function Home() {
  const { t } = useTranslation();
  const widgets: WidgetOption[] = [
    { id: 'monthly-summary', title: t('home.widgets.monthlySummary'), Widget: WidgetMonthlySummary },
    {
      id: 'expenses-by-payment-method',
      title: t('home.widgets.expensesByPaymentMethod'),
      Widget: WidgetExpensesByPaymentMethod,
    },
    { id: 'income-by-account', title: t('home.widgets.incomeByAccount'), Widget: WidgetIncomeByAccount },
    { id: 'upcoming-due-dates', title: t('home.widgets.upcomingDueDates'), Widget: WidgetUpcomingDueDates },
  ];

  const [state, handlers] = useListState(widgets);

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
          <widget.Widget key={widget.id} />
        ))}
      </Flex>
    </Layout>
  );
}

