import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { ExpenseDto, ExpenseFilterDto, RecurringExpenseDto, RecurringExpenseFilterDto } from 'src/dto/expenses.dto';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Expense } from 'src/entities/expense.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { User } from 'src/entities/user.entity';
import { CurrencyNotFoundException } from 'src/exceptions/currencies.exceptions';
import { ExpenseNotFoundException, RecurringExpenseNotFoundException } from 'src/exceptions/expenses.exceptions';
import { PaymentMethodNotFoundException } from 'src/exceptions/payment-methods.exceptions';
import { PaginatedResults } from 'src/types/pagination';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

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
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  async getUserExpenses(user: Omit<User, 'passwordHash'>, query: ExpenseFilterDto): Promise<PaginatedResults<Expense>> {
    const { page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd } = query;
    const [result, total] = await this.expenseRepository.findAndCount({
      where: {
        user: { uuid: user.uuid },
        date: rangeStart
          ? rangeEnd
            ? Between(DateTime.fromISO(rangeStart).toJSDate(), DateTime.fromISO(rangeEnd).toJSDate())
            : MoreThanOrEqual(DateTime.fromISO(rangeStart).toJSDate())
          : rangeEnd
            ? LessThanOrEqual(DateTime.fromISO(rangeEnd).toJSDate())
            : undefined,
      },
      order: { [sortBy]: sortOrder },
      relations: ['currency', 'paymentMethod', 'taxes', 'toCurrency'],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items: result, totalCount: total, pageSize: pageSize, currentPage: page };
  }

  async getUserExpenseByUuid(user: Omit<User, 'passwordHash'>, expenseUuid: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { uuid: expenseUuid, user: { uuid: user.uuid } },
      relations: ['currency', 'paymentMethod', 'taxes', 'toCurrency'],
    });
    if (!expense) throw new ExpenseNotFoundException();
    return expense;
  }

  async getUserRecurringExpenses(
    user: Omit<User, 'passwordHash'>,
    query: RecurringExpenseFilterDto
  ): Promise<PaginatedResults<RecurringExpense>> {
    const { page, pageSize } = query;
    const [result, total] = await this.recurringExpenseRepository.findAndCount({
      where: { user: { uuid: user.uuid } },
      relations: ['currency', 'paymentMethod', 'taxes'],
      order: { [query.sortBy]: query.sortOrder },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items: result, totalCount: total, pageSize: pageSize, currentPage: page };
  }

  async getUserRecurringExpenseByUuid(
    user: Omit<User, 'passwordHash'>,
    recurringExpenseUuid: string
  ): Promise<RecurringExpense> {
    const recurringExpense = await this.recurringExpenseRepository.findOne({
      where: { uuid: recurringExpenseUuid, user: { uuid: user.uuid } },
      relations: ['currency', 'paymentMethod', 'taxes'],
    });
    if (!recurringExpense) throw new RecurringExpenseNotFoundException();
    return recurringExpense;
  }

  async createUserExpense(user: Omit<User, 'passwordHash'>, expenseDto: ExpenseDto): Promise<Expense> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: expenseDto.paymentMethod, user: { uuid: user.uuid } },
      relations: ['account', 'account.currency'],
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    const expenseCurrency = await this.currencyRepository.findOneBy({ id: expenseDto.currency });
    if (!expenseCurrency) throw new CurrencyNotFoundException();
    const expenseCurrencyRate = await this.exchangeRateRepository.findOne({
      where: { currency: { id: expenseCurrency.id } },
    });
    const accountCurrencyRate = await this.exchangeRateRepository.findOne({
      where: { currency: { id: paymentMethod.account.currency.id } },
    });
    const newExpense = this.expenseRepository.create({
      user: { uuid: user.uuid },
      description: expenseDto.description,
      amount: expenseDto.amount,
      currency: { id: expenseDto.currency },
      paymentMethod: { uuid: expenseDto.paymentMethod },
      taxes: expenseDto.taxes.map((uuid) => ({ uuid })),
      date: DateTime.fromISO(expenseDto.date).toJSDate(),
      fromExchangeRate: expenseCurrencyRate?.rate ?? 1.0,
      toExchangeRate: accountCurrencyRate?.rate ?? 1.0,
      toCurrency: { id: paymentMethod.account.currency.id },
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
      taxes: recurringExpenseDto.taxes.map((uuid) => ({ uuid })),
      status: recurringExpenseDto.status,
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
    Object.assign(expense, {
      description: expenseDto.description,
      amount: expenseDto.amount,
      currency: { id: expenseDto.currency },
      paymentMethod: { uuid: expenseDto.paymentMethod },
      taxes: expenseDto.taxes.map((uuid) => ({ uuid })),
      date: DateTime.fromISO(expenseDto.date).toJSDate(),
      fromExchangeRate: expenseDto.fromExchangeRate,
      toExchangeRate: expenseDto.toExchangeRate,
      toCurrency: { id: expenseDto.toCurrency },
    });
    return this.expenseRepository.save(expense);
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
    Object.assign(recurringExpense, {
      description: recurringExpenseDto.description,
      amount: recurringExpenseDto.amount,
      currency: { id: recurringExpenseDto.currency },
      paymentMethod: { uuid: recurringExpenseDto.paymentMethod },
      taxes: recurringExpenseDto.taxes.map((uuid) => ({ uuid })),
      status: recurringExpenseDto.status,
      recurrenceRule: recurringExpenseDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringExpenseRepository.save(recurringExpense);
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

