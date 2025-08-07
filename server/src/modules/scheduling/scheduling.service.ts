import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { getCreditFields } from 'src/utils/payment-method.utils';
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
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  private readonly logger = new Logger(SchedulingService.name);

  async onApplicationBootstrap(): Promise<void> {
    await this.runScheduledRecurringExpenses();
    await this.runScheduledRecurringIncomes();
    await this.updatePaymentMethodDueDates();
  }

  @Cron('0 0 */1 * * *')
  async runScheduledRecurringExpenses(): Promise<void> {
    this.logger.log('Running scheduled recurring expenses');
    const recurringExpenses = await this.recurringExpenseRepository.find({
      where: { status: true },
      relations: [
        'user',
        'currency',
        'paymentMethod',
        'paymentMethod.account',
        'paymentMethod.account.currency',
        'category',
        'taxes',
      ],
    });
    let updatedExpensesCount: number = 0;
    for (const recurringExpense of recurringExpenses) {
      const nextOccurrence = recurringExpense.nextOccurrence
        ? DateTime.fromJSDate(recurringExpense.nextOccurrence).startOf('day')
        : null;
      if (nextOccurrence && nextOccurrence <= DateTime.now()) {
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
        recurringExpense.nextOccurrence = rrulestr(recurringExpense.recurrenceRule).after(
          nextOccurrence.endOf('day').toJSDate()
        );
        await this.recurringExpenseRepository.save(recurringExpense);
        updatedExpensesCount++;
      }
    }
    this.logger.log(`${updatedExpensesCount} recurring expenses processed successfully.`);
  }

  @Cron('0 0 */1 * * *')
  async runScheduledRecurringIncomes(): Promise<void> {
    this.logger.log('Running scheduled recurring incomes');
    const recurringIncomes = await this.recurringIncomeRepository.find({
      where: { status: true },
      relations: ['user', 'currency', 'account', 'account.currency', 'source'],
    });
    let updatedIncomesCount: number = 0;
    for (const recurringIncome of recurringIncomes) {
      const nextOccurrence = recurringIncome.nextOccurrence
        ? DateTime.fromJSDate(recurringIncome.nextOccurrence).startOf('day')
        : null;
      if (nextOccurrence && nextOccurrence <= DateTime.now()) {
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
        recurringIncome.nextOccurrence = rrulestr(recurringIncome.recurrenceRule).after(
          nextOccurrence.endOf('day').toJSDate()
        );
        await this.recurringIncomeRepository.save(recurringIncome);
        updatedIncomesCount++;
      }
    }
    this.logger.log(`${updatedIncomesCount} recurring incomes processed successfully.`);
  }

  @Cron('0 0 */1 * * *')
  async updatePaymentMethodDueDates(): Promise<void> {
    this.logger.log('Updating payment method due dates');
    const paymentMethods = await this.paymentMethodRepository.find({ where: { credit: true } });
    for (const paymentMethod of paymentMethods) {
      Object.assign(paymentMethod, getCreditFields(paymentMethod));
      await this.paymentMethodRepository.save(paymentMethod);
    }
    this.logger.log('Payment method due dates updated successfully.');
  }
}

