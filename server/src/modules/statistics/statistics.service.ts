import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { StatsExpensesByPaymentMethodDto, StatsIncomeByAccountDto, StatsSummaryParamsDto, StatsUpcomingExpensesDto, SummaryFilterBy, UpcomingExpensesFilterBy, } from 'src/dto/statistics.dto';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { MonthlySummary, PieChartData, UpcomingDueDate } from 'src/types/statistics';
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
    private readonly recurringExpenseRepository: Repository<RecurringExpense>
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
      const totalExpenses = expensesByPaymentMethod.reduce((sum, expense) => {
        const taxes = expense.taxes.map((tax) => tax.rate);
        const totalAmount = expense.amount + (taxes.reduce((acc, val) => acc + val, 0) / 100) * expense.amount;
        return sum + convert(totalAmount, expense.fromExchangeRate, accountCurrencyExchangeRate?.rate ?? 1);
      }, 0);
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
  ): Promise<PieChartData[]> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['paymentMethod', 'taxes'],
    });
    const paymentMethodGroups = Object.groupBy(expenses, (expense) => expense.paymentMethod.uuid);
    const results = Object.entries(paymentMethodGroups)
      .map(([paymentMethodUuid, expenses]) => {
        const paymentMethod = expenses![0].paymentMethod;
        const totalValue = expenses!.reduce((sum, expense) => {
          const totalAmount =
            expense.amount + (expense.taxes.map((tax) => +tax.rate).reduce((a, b) => a + b, 0) / 100) * expense.amount;
          return sum + convert(totalAmount, expense.fromExchangeRate, 1);
        }, 0);
        return {
          name: paymentMethod.name,
          value: Number(totalValue.toFixed(2)),
          color: paymentMethod.iconColor,
        };
      })
      .sort((a, b) => b.value - a.value);
    return results;
  }

  async getUserExpensesByCategory(
    userUuid: string,
    queryParams: StatsExpensesByPaymentMethodDto
  ): Promise<PieChartData[]> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['category', 'taxes'],
    });
    const categoryGroups = Object.groupBy(expenses, (expense) => expense.category.uuid);
    const results = Object.entries(categoryGroups)
      .map(([categoryUuid, expenses]) => {
        const category = expenses![0].category;
        const totalValue = expenses!.reduce((sum, expense) => {
          const taxes = expense.taxes.map((tax) => tax.rate);
          const totalAmount = expense.amount + (taxes.reduce((acc, val) => acc + val, 0) / 100) * expense.amount;
          return sum + convert(totalAmount, expense.fromExchangeRate, 1);
        }, 0);
        return {
          name: category.name,
          value: Number(totalValue.toFixed(2)),
          color: category.iconColor,
        };
      })
      .sort((a, b) => b.value - a.value);
    return results;
  }

  async getUserIncomeByAccount(userUuid: string, queryParams: StatsIncomeByAccountDto): Promise<PieChartData[]> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['account'],
    });
    const accountGroups = Object.groupBy(incomes, (income) => income.account.uuid);
    const results = Object.entries(accountGroups)
      .map(([accountUuid, incomes]) => {
        const account = incomes![0].account;
        const totalValue = incomes!.reduce((sum, income) => {
          return sum + convert(income.amount, income.fromExchangeRate, 1);
        }, 0);
        return {
          name: account.name,
          value: Number(totalValue.toFixed(2)),
          color: account.iconColor,
        };
      })
      .sort((a, b) => b.value - a.value);
    return results;
  }

  async getUserIncomeBySource(userUuid: string, queryParams: StatsIncomeByAccountDto): Promise<PieChartData[]> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['source'],
    });
    const sourceGroups = Object.groupBy(incomes, (income) => income.source?.uuid || 'no-source');
    const results = Object.entries(sourceGroups)
      .map(([sourceUuid, incomes]) => {
        const source = incomes![0].source || { name: 'No Source', iconColor: '#000000' };
        const totalValue = incomes!.reduce((sum, income) => {
          return sum + convert(income.amount, income.fromExchangeRate, 1);
        }, 0);
        return {
          name: source.name,
          value: Number(totalValue.toFixed(2)),
          color: source.color,
        };
      })
      .sort((a, b) => b.value - a.value);
    return results;
  }

  async getUserSummary(userUuid: string, queryParams: StatsSummaryParamsDto): Promise<MonthlySummary[]> {
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

  private async getUserSummaryLastNthMonths(userUuid: string, months: number = 3): Promise<MonthlySummary[]> {
    const rangeStart = DateTime.now()
      .startOf('month')
      .minus({ months: months - 1 });
    const rangeEnd = DateTime.now().endOf('month');
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['paymentMethod', 'paymentMethod.account', 'paymentMethod.account.currency', 'taxes'],
    });
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['currency', 'account', 'account.currency'],
    });
    const summary: { date: string; Expenses: number; Income: number }[] = [];
    let currentDate = rangeStart;
    while (currentDate < rangeEnd) {
      const monthExpenses = expenses.filter((expense) =>
        DateTime.fromJSDate(expense.date).hasSame(currentDate, 'month')
      );
      const monthIncomes = incomes.filter((income) => DateTime.fromJSDate(income.date).hasSame(currentDate, 'month'));
      const sumExpenses = monthExpenses.reduce((sum, expense) => {
        const taxes = expense.taxes.map((tax) => tax.rate);
        const totalAmount = expense.amount + (taxes.reduce((acc, val) => acc + val, 0) / 100) * expense.amount;
        return sum + convert(totalAmount, expense.fromExchangeRate, 1);
      }, 0);
      const sumIncomes = monthIncomes.reduce((sum, income) => {
        return sum + convert(income.amount, income.fromExchangeRate, 1);
      }, 0);
      summary.push({
        date: currentDate.toISODate(),
        Expenses: Number(sumExpenses.toFixed(2)),
        Income: Number(sumIncomes.toFixed(2)),
      });
      currentDate = currentDate.plus({ months: 1 });
    }
    return summary;
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
}

