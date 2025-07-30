import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rrulestr } from 'rrule';
import { ExpenseDto, RecurringExpenseDto } from 'src/dto/expenses.dto';
import { Account } from 'src/entities/account.entity';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { User } from 'src/entities/user.entity';
import { CurrencyNotFoundException } from 'src/exceptions/currencies.exceptions';
import { ExpenseNotFoundException, RecurringExpenseNotFoundException } from 'src/exceptions/expenses.exceptions';
import { PaymentMethodNotFoundException } from 'src/exceptions/payment-methods.exceptions';
import { convert } from 'src/utils/currency.utils';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(RecurringExpense)
    private readonly recurringExpenseRepository: Repository<RecurringExpense>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  async getUserExpenses(user: Omit<User, 'passwordHash'>): Promise<Expense[]> {
    return this.expenseRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async getUserRecurringExpenses(user: Omit<User, 'passwordHash'>): Promise<RecurringExpense[]> {
    return this.recurringExpenseRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async createUserExpense(user: Omit<User, 'passwordHash'>, expenseDto: ExpenseDto): Promise<Expense> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: expenseDto.paymentMethod, user: { uuid: user.uuid } },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    const expenseCurrency = await this.currencyRepository.findOneBy({ id: expenseDto.currency });
    if (!expenseCurrency) throw new CurrencyNotFoundException();

    const newExpense = this.expenseRepository.create({
      user: { uuid: user.uuid },
      description: expenseDto.description,
      amount: expenseDto.amount,
      currency: { id: expenseDto.currency },
      paymentMethod: { uuid: expenseDto.paymentMethod },
      taxes: expenseDto.taxes.map((uuid) => ({ uuid })),
      date: expenseDto.date,
    });
    return this.expenseRepository.save(newExpense);
  }

  async createUserRecurringExpense(
    user: Omit<User, 'passwordHash'>,
    recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    const nextOccurrence = rrulestr(recurringExpenseDto.recurrenceRule).after(new Date(), true);
    const newRecurringExpense = this.recurringExpenseRepository.create({
      user: { uuid: user.uuid },
      description: recurringExpenseDto.description,
      amount: recurringExpenseDto.amount,
      currency: { id: recurringExpenseDto.currency },
      paymentMethod: { uuid: recurringExpenseDto.paymentMethod },
      status: recurringExpenseDto.status,
      startDate: recurringExpenseDto.startDate,
      recurrenceRule: recurringExpenseDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringExpenseRepository.save(newRecurringExpense);
  }

  async updateUserExpense(
    user: Omit<User, 'passwordHash'>,
    expenseUuid: string,
    expenseDto: ExpenseDto
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findOneBy({ uuid: expenseUuid, user: { uuid: user.uuid } });
    if (!expense) throw new ExpenseNotFoundException();
    await this.expenseRepository.update(expenseUuid, {
      description: expenseDto.description,
      amount: expenseDto.amount,
      currency: { id: expenseDto.currency },
      paymentMethod: { uuid: expenseDto.paymentMethod },
      taxes: expenseDto.taxes.map((uuid) => ({ uuid })),
      date: expenseDto.date,
    });
    return (await this.expenseRepository.findOneBy({ uuid: expenseUuid }))!;
  }

  async updateUserRecurringExpense(
    user: Omit<User, 'passwordHash'>,
    recurringExpenseUuid: string,
    recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    const recurringExpense = await this.recurringExpenseRepository.findOneBy({
      uuid: recurringExpenseUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringExpense) throw new RecurringExpenseNotFoundException();
    const nextOccurrence = rrulestr(recurringExpenseDto.recurrenceRule).after(new Date(), true);
    await this.recurringExpenseRepository.update(recurringExpenseUuid, {
      description: recurringExpenseDto.description,
      amount: recurringExpenseDto.amount,
      currency: { id: recurringExpenseDto.currency },
      paymentMethod: { uuid: recurringExpenseDto.paymentMethod },
      status: recurringExpenseDto.status,
      startDate: recurringExpenseDto.startDate,
      recurrenceRule: recurringExpenseDto.recurrenceRule,
      nextOccurrence,
    });
    return (await this.recurringExpenseRepository.findOneBy({ uuid: recurringExpenseUuid }))!;
  }

  async deleteUserExpense(user: Omit<User, 'passwordHash'>, expenseUuid: string): Promise<void> {
    const expense = await this.expenseRepository.findOne({
      where: { uuid: expenseUuid, user: { uuid: user.uuid } },
    });
    if (!expense) throw new ExpenseNotFoundException();
    await this.expenseRepository.remove(expense);
  }

  async deleteUserRecurringExpense(user: Omit<User, 'passwordHash'>, recurringExpenseUuid: string): Promise<void> {
    const recurringExpense = await this.recurringExpenseRepository.findOneBy({
      uuid: recurringExpenseUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringExpense) throw new RecurringExpenseNotFoundException();
    await this.recurringExpenseRepository.remove(recurringExpense);
  }
}

