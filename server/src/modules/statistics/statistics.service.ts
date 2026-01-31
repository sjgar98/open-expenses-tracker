import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sum } from 'es-toolkit';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { StatsExpensesByPaymentMethodDto, StatsExpensesHeatmapDto, StatsIncomeByAccountDto, StatsSummaryParamsDto, StatsUpcomingExpensesDto, SummaryFilterBy, UpcomingExpensesFilterBy, } from 'src/dto/statistics.dto';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { UserSettings } from 'src/entities/user-settings.entity';
import { ExpensesHeatmap, MonthlySummary, PieChartData, StatisticsResponse, UpcomingDueDate, } from 'src/types/statistics';
import { convert } from 'src/utils/currency.utils';
import { Between, Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
    @InjectRepository(RecurringExpense)
    private readonly recurringExpenseRepository: Repository<RecurringExpense>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepository: Repository<UserSettings>,
    @InjectRepository(HistoricExchangeRate)
    private readonly historicExchangeRateRepository: Repository<HistoricExchangeRate>
  ) {}

  async getUserUpcomingDueDates(userUuid: string): Promise<UpcomingDueDate[]> {
    const now = DateTime.now();
    const paymentMethods = await this.paymentMethodRepository.find({
      where: {
        user: { uuid: userUuid },
        credit: true,
        isDeleted: false,
      },
      relations: ['account', 'account.currency'],
    });
    const upcomingDueDates: any[] = [];
    for (const paymentMethod of paymentMethods) {
      const accountCurrencyExchangeRate = await this.exchangeRateRepository.findOne({
        where: { currency: { id: paymentMethod.account.currency.id } },
      });
      const lastClosingOccurrence = DateTime.fromJSDate(paymentMethod.lastClosingOccurrence!);
      const nextClosingOccurrence = DateTime.fromJSDate(paymentMethod.nextClosingOccurrence!);
      const nextDueOccurrence = DateTime.fromJSDate(paymentMethod.nextDueOccurrence!);
      let rangeStart: DateTime;
      let rangeEnd: DateTime;
      if (nextClosingOccurrence < now) {
        rangeStart = lastClosingOccurrence;
        rangeEnd = nextClosingOccurrence;
      } else {
        const creditClosingDateRule = rrulestr(paymentMethod.creditClosingDateRule!);
        creditClosingDateRule.options.dtstart = lastClosingOccurrence.minus({ days: 40 }).toJSDate();
        rangeStart = DateTime.fromJSDate(creditClosingDateRule.before(lastClosingOccurrence.toJSDate())!);
        rangeEnd = lastClosingOccurrence;
      }
      const expensesByPaymentMethod = await this.expenseRepository.find({
        where: {
          user: { uuid: userUuid },
          paymentMethod: { uuid: paymentMethod.uuid },
          date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()),
        },
        relations: ['currency', 'taxes'],
      });
      let totalExpenses = 0;
      for (const expense of expensesByPaymentMethod) {
        const expenseCurrencyExchangeRate = await this.exchangeRateRepository.findOne({
          where: { currency: { id: expense.currency.id } },
        });
        const taxes = expense.taxes.map((tax) => tax.rate);
        const totalAmount = expense.amount + (taxes.reduce((acc, val) => acc + val, 0) / 100) * expense.amount;
        totalExpenses += convert(
          totalAmount,
          expenseCurrencyExchangeRate?.rate ?? 1,
          accountCurrencyExchangeRate?.rate ?? 1
        );
      }
      upcomingDueDates.push({
        paymentMethod: paymentMethod,
        value: totalExpenses,
        closingDate: rangeEnd.toJSDate(),
        dueDate: nextDueOccurrence.toJSDate(),
      });
    }
    return upcomingDueDates;
  }

  async getUserExpensesByPaymentMethod(
    userUuid: string,
    queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['paymentMethod', 'taxes', 'currency'],
    });
    const paymentMethodGroups = Object.groupBy(expenses, (expense) => expense.paymentMethod.uuid);
    const results: PieChartData[] = [];
    for (const expenses of Object.values(paymentMethodGroups)) {
      const paymentMethod = expenses![0].paymentMethod;
      let totalValue = 0;
      for (const expense of expenses!) {
        const searchDate = DateTime.fromJSDate(expense.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        const totalAmount =
          expense.amount + (expense.taxes.map((tax) => +tax.rate).reduce((a, b) => a + b, 0) / 100) * expense.amount;
        totalValue += convert(
          totalAmount,
          historicExchangeRates.rates[expense.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      results.push({
        name: paymentMethod.name,
        value: Number(totalValue.toFixed(2)),
        color: paymentMethod.iconColor,
      });
    }
    return { displayCurrency, data: results.sort((a, b) => b.value - a.value) };
  }

  async getUserExpensesByCategory(
    userUuid: string,
    queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['category', 'taxes', 'currency'],
    });
    const categoryGroups = Object.groupBy(expenses, (expense) => expense.category.uuid);
    const results: PieChartData[] = [];
    for (const expenses of Object.values(categoryGroups)) {
      const category = expenses![0].category;
      let totalValue = 0;
      for (const expense of expenses!) {
        const searchDate = DateTime.fromJSDate(expense.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        const totalAmount =
          expense.amount + (expense.taxes.map((tax) => +tax.rate).reduce((a, b) => a + b, 0) / 100) * expense.amount;
        totalValue += convert(
          totalAmount,
          historicExchangeRates.rates[expense.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      results.push({
        name: category.name,
        value: Number(totalValue.toFixed(2)),
        color: category.iconColor,
      });
    }
    return { displayCurrency, data: results.sort((a, b) => b.value - a.value) };
  }

  async getUserIncomeByAccount(
    userUuid: string,
    queryParams: StatsIncomeByAccountDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['account', 'currency'],
    });
    const accountGroups = Object.groupBy(incomes, (income) => income.account.uuid);
    const results: PieChartData[] = [];
    for (const incomes of Object.values(accountGroups)) {
      const account = incomes![0].account;
      let totalValue = 0;
      for (const income of incomes!) {
        const searchDate = DateTime.fromJSDate(income.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        totalValue += convert(
          income.amount,
          historicExchangeRates.rates[income.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      results.push({
        name: account.name,
        value: Number(totalValue.toFixed(2)),
        color: account.iconColor,
      });
    }
    return { displayCurrency, data: results.sort((a, b) => b.value - a.value) };
  }

  async getUserIncomeBySource(
    userUuid: string,
    queryParams: StatsIncomeByAccountDto
  ): Promise<StatisticsResponse<PieChartData[]>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['source', 'currency'],
    });
    const sourceGroups = Object.groupBy(incomes, (income) => income.source?.uuid || 'no-source');
    const results: PieChartData[] = [];
    for (const incomes of Object.values(sourceGroups)) {
      const source = incomes![0].source;
      let totalValue = 0;
      for (const income of incomes!) {
        const searchDate = DateTime.fromJSDate(income.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        totalValue += convert(
          income.amount,
          historicExchangeRates.rates[income.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      results.push({
        name: source.name,
        value: Number(totalValue.toFixed(2)),
        color: source.color,
      });
    }
    return { displayCurrency, data: results.sort((a, b) => b.value - a.value) };
  }

  async getUserSummary(
    userUuid: string,
    queryParams: StatsSummaryParamsDto
  ): Promise<StatisticsResponse<MonthlySummary[]>> {
    switch (queryParams.filterBy) {
      case SummaryFilterBy.Last12Months:
        return this.getUserSummaryLastNthMonths(userUuid, 12);
      case SummaryFilterBy.Last6Months:
        return this.getUserSummaryLastNthMonths(userUuid, 6);
      case SummaryFilterBy.Last3Months:
        return this.getUserSummaryLastNthMonths(userUuid, 3);
      default:
        return this.getUserSummaryLastNthMonths(userUuid);
    }
  }

  private async getUserSummaryLastNthMonths(
    userUuid: string,
    months: number = 3
  ): Promise<StatisticsResponse<MonthlySummary[]>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.now()
      .startOf('month')
      .minus({ months: months - 1 });
    const rangeEnd = DateTime.now().endOf('month');
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['paymentMethod', 'paymentMethod.account', 'paymentMethod.account.currency', 'taxes', 'currency'],
    });
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['currency', 'account', 'account.currency', 'currency'],
    });
    const summary: { date: string; Expenses: number; Income: number }[] = [];
    let currentDate = rangeStart;
    while (currentDate < rangeEnd) {
      const monthExpenses = expenses.filter((expense) =>
        DateTime.fromJSDate(expense.date).hasSame(currentDate, 'month')
      );
      const monthIncomes = incomes.filter((income) => DateTime.fromJSDate(income.date).hasSame(currentDate, 'month'));
      let sumExpenses = 0;
      for (const expense of monthExpenses) {
        const searchDate = DateTime.fromJSDate(expense.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        const totalAmount =
          expense.amount + (expense.taxes.map((tax) => +tax.rate).reduce((a, b) => a + b, 0) / 100) * expense.amount;
        sumExpenses += convert(
          totalAmount,
          historicExchangeRates.rates[expense.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      let sumIncomes = 0;
      for (const income of monthIncomes) {
        const searchDate = DateTime.fromJSDate(income.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        sumIncomes += convert(
          income.amount,
          historicExchangeRates.rates[income.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      summary.push({
        date: currentDate.toISODate(),
        Expenses: Number(sumExpenses.toFixed(2)),
        Income: Number(sumIncomes.toFixed(2)),
      });
      currentDate = currentDate.plus({ months: 1 });
    }
    return { displayCurrency, data: summary };
  }

  async getUserUpcomingExpenses(userUuid: string, queryParams: StatsUpcomingExpensesDto): Promise<RecurringExpense[]> {
    const rangeStart: DateTime = DateTime.now();
    let rangeEnd: DateTime;
    switch (queryParams.filterBy) {
      case UpcomingExpensesFilterBy.SevenDays:
        rangeEnd = rangeStart.plus({ days: 7 });
        break;
      case UpcomingExpensesFilterBy.ThreeDays:
        rangeEnd = rangeStart.plus({ days: 3 });
        break;
      case UpcomingExpensesFilterBy.OneDay:
      default:
        rangeEnd = rangeStart.plus({ days: 1 });
    }
    return this.recurringExpenseRepository.find({
      where: {
        user: { uuid: userUuid },
        status: true,
        nextOccurrence: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()),
      },
      order: { nextOccurrence: 'ASC' },
      relations: {
        currency: true,
        paymentMethod: { account: { currency: true } },
        category: true,
        taxes: true,
      },
    });
  }

  async getUserExpensesHeatmap(
    userUuid: string,
    queryParams: StatsExpensesHeatmapDto
  ): Promise<StatisticsResponse<ExpensesHeatmap>> {
    const userSettings = await this.userSettingsRepository.findOne({ where: { user: { uuid: userUuid } } });
    if (!userSettings) throw new Error('User settings not found');
    const displayCurrency = userSettings.displayCurrency;
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['category', 'taxes', 'currency'],
    });
    let currentDate = rangeStart;
    const expensesHeatmap: ExpensesHeatmap = {};
    while (+currentDate <= +rangeEnd) {
      const currentDateExpenses = await Promise.all(
        expenses
          .filter((expense) => +DateTime.fromJSDate(expense.date).startOf('day') === +currentDate)
          .map(async (expense) => {
            const searchDate = DateTime.fromJSDate(expense.date).startOf('day');
            const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
              where: { date: searchDate.toJSDate() },
            });
            if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) return 0;
            const totalAmount =
              expense.amount +
              (expense.taxes.map((tax) => +tax.rate).reduce((a, b) => a + b, 0) / 100) * expense.amount;
            return convert(
              totalAmount,
              historicExchangeRates.rates[expense.currency.code],
              historicExchangeRates.rates[displayCurrency]
            );
          })
      );
      const expensesSum = Number(sum(currentDateExpenses).toFixed(2));
      if (expensesSum > 0) {
        expensesHeatmap[currentDate.toFormat('yyyy-MM-dd')] = expensesSum;
      }
      currentDate = currentDate.plus({ days: 1 });
    }
    return {
      displayCurrency,
      data: expensesHeatmap,
    } satisfies StatisticsResponse<ExpensesHeatmap>;
  }
}

