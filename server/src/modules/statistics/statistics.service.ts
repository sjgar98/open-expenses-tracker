import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { StatsExpensesByPaymentMethodDto, StatsIncomeByAccountDto, StatsSummaryParamsDto, SummaryFilterBy, } from 'src/dto/statistics.dto';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { convert } from 'src/utils/currency.utils';
import { Between, In, Repository } from 'typeorm';

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
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  async getUserUpcomingDueDates(userUuid: string): Promise<any> {
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

  async getUserExpensesByPaymentMethod(userUuid: string, queryParams: StatsExpensesByPaymentMethodDto): Promise<any> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const expenses = await this.expenseRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['paymentMethod', 'taxes'],
    });
    const paymentMethodGroups = Object.groupBy(expenses, (expense) => expense.paymentMethod.uuid);
    const results = Object.entries(paymentMethodGroups).map(([paymentMethodUuid, expenses]) => {
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
    });
    return results;
  }

  async getUserIncomeByAccount(userUuid: string, queryParams: StatsIncomeByAccountDto): Promise<any> {
    const rangeStart = DateTime.fromISO(queryParams.rangeStart);
    const rangeEnd = DateTime.fromISO(queryParams.rangeEnd);
    const incomes = await this.incomeRepository.find({
      where: { user: { uuid: userUuid }, date: Between(rangeStart.toJSDate(), rangeEnd.toJSDate()) },
      relations: ['account'],
    });
    const accountGroups = Object.groupBy(incomes, (income) => income.account.uuid);
    const results = Object.entries(accountGroups).map(([accountUuid, incomes]) => {
      const account = incomes![0].account;
      const totalValue = incomes!.reduce((sum, income) => {
        return sum + convert(income.amount, income.fromExchangeRate, 1);
      }, 0);
      return {
        name: account.name,
        value: Number(totalValue.toFixed(2)),
        color: account.iconColor,
      };
    });
    return results;
  }

  async getUserSummary(userUuid: string, queryParams: StatsSummaryParamsDto) {
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

  private async getUserSummaryLastNthMonths(userUuid: string, months: number = 3) {
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
}

