import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { getCreditFields } from 'src/utils/payment-method.utils';
import { Repository } from 'typeorm';

export interface ScheduledSyncResult {
  expenses: number;
  incomes: number;
  paymentMethods: number;
}

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
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  private readonly logger = new Logger(SchedulingService.name);
  private queue: Promise<unknown> = Promise.resolve();

  async onApplicationBootstrap(): Promise<void> {
    await this.syncAll();
  }

  @Cron('0 0 */1 * * *')
  async syncAll(): Promise<ScheduledSyncResult> {
    return this.runSync();
  }

  async syncUser(user: LoggedUser): Promise<ScheduledSyncResult> {
    return this.runSync(user);
  }

  private runSync(user?: LoggedUser): Promise<ScheduledSyncResult> {
    const run = this.queue.then(async () => ({
      expenses: await this.runScheduledRecurringExpenses(user),
      incomes: await this.runScheduledRecurringIncomes(user),
      paymentMethods: await this.updatePaymentMethodDueDates(user),
    }));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async runScheduledRecurringExpenses(user?: LoggedUser): Promise<number> {
    this.logger.log('Running scheduled recurring expenses');
    const recurringExpenses = await this.recurringExpenseRepository.find({
      where: { status: true, ...(user && { user: { uuid: user.uuid } }) },
      relations: {
        user: true,
        currency: true,
        paymentMethod: { account: { currency: true } },
        category: true,
        taxes: true,
      },
    });
    let createdExpensesCount = 0;
    for (const recurringExpense of recurringExpenses) {
      let nextOccurrence = this.toStartOfDay(recurringExpense.nextOccurrence);
      if (!nextOccurrence || nextOccurrence > DateTime.now()) continue;
      const rule = rrulestr(recurringExpense.recurrenceRule);
      while (nextOccurrence && nextOccurrence <= DateTime.now()) {
        const newExpense = this.expenseRepository.create({
          user: { uuid: recurringExpense.user.uuid },
          description: recurringExpense.description,
          amount: recurringExpense.amount,
          currency: recurringExpense.currency,
          paymentMethod: { uuid: recurringExpense.paymentMethod.uuid },
          category: { uuid: recurringExpense.category.uuid },
          taxes: recurringExpense.taxes.map((tax) => ({ uuid: tax.uuid })),
          date: nextOccurrence.toJSDate(),
        });
        await this.expenseRepository.save(newExpense);
        recurringExpense.lastOccurrence = nextOccurrence.toJSDate();
        recurringExpense.nextOccurrence = rule.after(nextOccurrence.endOf('day').toJSDate());
        nextOccurrence = this.toStartOfDay(recurringExpense.nextOccurrence);
        createdExpensesCount++;
      }
      await this.recurringExpenseRepository.save(recurringExpense);
    }
    this.logger.log(`${createdExpensesCount} recurring expenses processed successfully.`);
    return createdExpensesCount;
  }

  private async runScheduledRecurringIncomes(user?: LoggedUser): Promise<number> {
    this.logger.log('Running scheduled recurring incomes');
    const recurringIncomes = await this.recurringIncomeRepository.find({
      where: { status: true, ...(user && { user: { uuid: user.uuid } }) },
      relations: { user: true, currency: true, account: { currency: true }, source: true },
    });
    let createdIncomesCount = 0;
    for (const recurringIncome of recurringIncomes) {
      let nextOccurrence = this.toStartOfDay(recurringIncome.nextOccurrence);
      if (!nextOccurrence || nextOccurrence > DateTime.now()) continue;
      const rule = rrulestr(recurringIncome.recurrenceRule);
      while (nextOccurrence && nextOccurrence <= DateTime.now()) {
        const newIncome = this.incomeRepository.create({
          user: { uuid: recurringIncome.user.uuid },
          description: recurringIncome.description,
          amount: recurringIncome.amount,
          currency: recurringIncome.currency,
          account: { uuid: recurringIncome.account.uuid },
          source: { uuid: recurringIncome.source.uuid },
          date: nextOccurrence.toJSDate(),
        });
        await this.incomeRepository.save(newIncome);
        recurringIncome.lastOccurrence = nextOccurrence.toJSDate();
        recurringIncome.nextOccurrence = rule.after(nextOccurrence.endOf('day').toJSDate());
        nextOccurrence = this.toStartOfDay(recurringIncome.nextOccurrence);
        createdIncomesCount++;
      }
      await this.recurringIncomeRepository.save(recurringIncome);
    }
    this.logger.log(`${createdIncomesCount} recurring incomes processed successfully.`);
    return createdIncomesCount;
  }

  private async updatePaymentMethodDueDates(user?: LoggedUser): Promise<number> {
    this.logger.log('Updating payment method due dates');
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { credit: true, ...(user && { user: { uuid: user.uuid } }) },
    });
    for (const paymentMethod of paymentMethods) {
      Object.assign(paymentMethod, getCreditFields(paymentMethod));
      await this.paymentMethodRepository.save(paymentMethod);
    }
    this.logger.log('Payment method due dates updated successfully.');
    return paymentMethods.length;
  }

  private toStartOfDay(date: Date | null | undefined): DateTime | null {
    return date ? DateTime.fromJSDate(date).startOf('day') : null;
  }
}
