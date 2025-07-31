import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchedulingService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(RecurringExpense)
    private readonly recurringExpenseRepository: Repository<RecurringExpense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(RecurringIncome)
    private readonly recurringIncomeRepository: Repository<RecurringIncome>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  private readonly logger = new Logger(SchedulingService.name);

  async onApplicationBootstrap(): Promise<void> {
    await this.runScheduledRecurringExpenses();
    await this.runScheduledRecurringIncomes();
  }

  @Cron('0 */1 * * *')
  async runScheduledRecurringExpenses(): Promise<void> {
    const recurringExpenses = await this.recurringExpenseRepository.find({
      where: { status: true },
      relations: [
        'user',
        'currency',
        'paymentMethod',
        'paymentMethod.account',
        'paymentMethod.account.currency',
        'taxes',
      ],
    });
    let updatedExpensesCount: number = 0;
    for (const recurringExpense of recurringExpenses) {
      const nextOccurrence = recurringExpense.nextOccurrence
        ? DateTime.fromISO(String(recurringExpense.nextOccurrence))
        : null;
      const expenseCurrencyRate = await this.exchangeRateRepository.findOne({
        where: { currency: { id: recurringExpense.currency.id } },
      });
      const accountCurrencyRate = await this.exchangeRateRepository.findOne({
        where: { currency: { id: recurringExpense.paymentMethod.account.currency.id } },
      });
      if (nextOccurrence && nextOccurrence <= DateTime.now()) {
        const newExpense = this.expenseRepository.create({
          user: { uuid: recurringExpense.user.uuid },
          description: recurringExpense.description,
          amount: recurringExpense.amount,
          currency: recurringExpense.currency,
          paymentMethod: { uuid: recurringExpense.paymentMethod.uuid },
          taxes: recurringExpense.taxes.map((tax) => ({ uuid: tax.uuid })),
          date: nextOccurrence.toJSDate(),
          fromExchangeRate: expenseCurrencyRate?.rate ?? 1.0,
          toExchangeRate: accountCurrencyRate?.rate ?? 1.0,
          toCurrency: { id: recurringExpense.paymentMethod.account.currency.id },
        });
        await this.expenseRepository.save(newExpense);
        recurringExpense.lastOccurrence = nextOccurrence.toJSDate();
        recurringExpense.nextOccurrence = rrulestr(recurringExpense.recurrenceRule).after(nextOccurrence.toJSDate());
        await this.recurringExpenseRepository.save(recurringExpense);
        updatedExpensesCount++;
      }
    }
    if (updatedExpensesCount > 0) {
      this.logger.log(`${updatedExpensesCount} recurring expenses processed successfully.`);
    }
  }

  @Cron('0 */1 * * *')
  async runScheduledRecurringIncomes(): Promise<void> {
    const recurringIncomes = await this.recurringIncomeRepository.find({
      where: { status: true },
      relations: ['user', 'currency', 'account', 'account.currency'],
    });
    let updatedIncomesCount: number = 0;
    for (const recurringIncome of recurringIncomes) {
      const nextOccurrence = recurringIncome.nextOccurrence
        ? DateTime.fromISO(String(recurringIncome.nextOccurrence))
        : null;
      const incomeCurrencyRate = await this.exchangeRateRepository.findOne({
        where: { currency: { id: recurringIncome.currency.id } },
      });
      const accountCurrencyRate = await this.exchangeRateRepository.findOne({
        where: { currency: { id: recurringIncome.account.currency.id } },
      });
      if (nextOccurrence && nextOccurrence <= DateTime.now()) {
        const newIncome = this.incomeRepository.create({
          user: { uuid: recurringIncome.user.uuid },
          description: recurringIncome.description,
          amount: recurringIncome.amount,
          currency: recurringIncome.currency,
          date: nextOccurrence.toJSDate(),
          fromExchangeRate: incomeCurrencyRate?.rate ?? 1.0,
          toExchangeRate: accountCurrencyRate?.rate ?? 1.0,
          toCurrency: { id: recurringIncome.account.currency.id },
        });
        await this.incomeRepository.save(newIncome);
        recurringIncome.lastOccurrence = nextOccurrence.toJSDate();
        recurringIncome.nextOccurrence = rrulestr(recurringIncome.recurrenceRule).after(nextOccurrence.toJSDate());
        await this.recurringIncomeRepository.save(recurringIncome);
        updatedIncomesCount++;
      }
    }
    if (updatedIncomesCount > 0) {
      this.logger.log(`${updatedIncomesCount} recurring incomes processed successfully.`);
    }
  }
}

