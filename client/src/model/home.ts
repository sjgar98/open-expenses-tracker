import type { WidgetProps } from './widget';
import WidgetExpensesByCategory from '../pages/Home/widgets/WidgetExpensesByCategory';
import WidgetExpensesByPaymentMethod from '../pages/Home/widgets/WidgetExpensesByPaymentMethod';
import WidgetIncomeByAccount from '../pages/Home/widgets/WidgetIncomeByAccount';
import WidgetIncomeBySource from '../pages/Home/widgets/WidgetIncomeBySource';
import WidgetMonthlySummary from '../pages/Home/widgets/WidgetMonthlySummary';
import WidgetUpcomingDueDates from '../pages/Home/widgets/WidgetUpcomingDueDates';
import WidgetUpcomingExpenses from '../pages/Home/widgets/WidgetUpcomingExpenses';

export interface WidgetState {
  id: string;
  visible: boolean;
}

export interface HomeState {
  enabledWidgets: WidgetState[];
}

export interface WidgetOption {
  id: string;
  title: string;
  Widget: React.FunctionComponent<WidgetProps>;
}

export const widgets: WidgetOption[] = [
  { id: 'monthly-summary', title: 'home.widgets.monthlySummary.title', Widget: WidgetMonthlySummary },
  { id: 'expenses-by-category', title: 'home.widgets.expensesByCategory.title', Widget: WidgetExpensesByCategory },
  {
    id: 'expenses-by-payment-method',
    title: 'home.widgets.expensesByPaymentMethod.title',
    Widget: WidgetExpensesByPaymentMethod,
  },
  { id: 'income-by-source', title: 'home.widgets.incomeBySource.title', Widget: WidgetIncomeBySource },
  { id: 'income-by-account', title: 'home.widgets.incomeByAccount.title', Widget: WidgetIncomeByAccount },
  { id: 'upcoming-due-dates', title: 'home.widgets.upcomingDueDates.title', Widget: WidgetUpcomingDueDates },
  { id: 'upcoming-expenses', title: 'home.widgets.upcomingExpenses.title', Widget: WidgetUpcomingExpenses },
];

