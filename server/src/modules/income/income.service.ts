import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';
import { IncomeDto, RecurringIncomeDto } from 'src/dto/income.dto';
import { Account } from 'src/entities/account.entity';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { User } from 'src/entities/user.entity';
import { AccountNotFoundException } from 'src/exceptions/accounts.exceptions';
import { CurrencyNotFoundException } from 'src/exceptions/currencies.exceptions';
import { IncomeNotFoundException, RecurringIncomeNotFoundException } from 'src/exceptions/income.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(RecurringIncome)
    private readonly recurringIncomeRepository: Repository<RecurringIncome>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  async getUserIncome(user: Omit<User, 'passwordHash'>): Promise<Income[]> {
    return this.incomeRepository.find({
      where: { user: { uuid: user.uuid } },
      order: { date: 'ASC' },
      relations: ['currency', 'account', 'toCurrency'],
    });
  }

  async getUserIncomeByUuid(user: Omit<User, 'passwordHash'>, incomeUuid: string): Promise<Income> {
    const income = await this.incomeRepository.findOne({
      where: { uuid: incomeUuid, user: { uuid: user.uuid } },
      relations: ['currency', 'account', 'toCurrency'],
    });
    if (!income) throw new IncomeNotFoundException();
    return income;
  }

  async getUserRecurringIncome(user: Omit<User, 'passwordHash'>): Promise<RecurringIncome[]> {
    return this.recurringIncomeRepository.find({
      where: { user: { uuid: user.uuid } },
      relations: ['currency', 'account'],
    });
  }

  async getUserRecurringIncomeByUuid(
    user: Omit<User, 'passwordHash'>,
    recurringIncomeUuid: string
  ): Promise<RecurringIncome> {
    const recurringIncome = await this.recurringIncomeRepository.findOne({
      where: { uuid: recurringIncomeUuid, user: { uuid: user.uuid } },
      relations: ['currency', 'account'],
    });
    if (!recurringIncome) throw new RecurringIncomeNotFoundException();
    return recurringIncome;
  }

  async createUserIncome(user: Omit<User, 'passwordHash'>, incomeDto: IncomeDto): Promise<Income> {
    const account = await this.accountRepository.findOne({
      where: { uuid: incomeDto.account, user: { uuid: user.uuid } },
      relations: ['currency'],
    });
    if (!account) throw new AccountNotFoundException();
    const incomeCurrency = await this.currencyRepository.findOneBy({ id: incomeDto.currency });
    if (!incomeCurrency) throw new CurrencyNotFoundException();
    const incomeCurrencyRate = await this.exchangeRateRepository.findOne({
      where: { currency: { id: incomeCurrency.id } },
    });
    const accountCurrencyRate = await this.exchangeRateRepository.findOne({
      where: { currency: { id: account.currency.id } },
    });
    const newIncome = this.incomeRepository.create({
      user: { uuid: user.uuid },
      description: incomeDto.description,
      amount: incomeDto.amount,
      currency: { id: incomeDto.currency },
      account: { uuid: incomeDto.account },
      date: DateTime.fromISO(incomeDto.date).toJSDate(),
      fromExchangeRate: incomeCurrencyRate?.rate ?? 1.0,
      toExchangeRate: accountCurrencyRate?.rate ?? 1.0,
      toCurrency: { id: account.currency.id },
    });
    return this.incomeRepository.save(newIncome);
  }

  async createUserRecurringIncome(
    user: Omit<User, 'passwordHash'>,
    recurringIncomeDto: RecurringIncomeDto
  ): Promise<RecurringIncome> {
    const nextOccurrence = rrulestr(recurringIncomeDto.recurrenceRule).after(new Date(), true);
    const newRecurringIncome = this.recurringIncomeRepository.create({
      user: { uuid: user.uuid },
      description: recurringIncomeDto.description,
      amount: recurringIncomeDto.amount,
      currency: { id: recurringIncomeDto.currency },
      account: { uuid: recurringIncomeDto.account },
      status: recurringIncomeDto.status,
      recurrenceRule: recurringIncomeDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringIncomeRepository.save(newRecurringIncome);
  }

  async updateUserIncome(user: Omit<User, 'passwordHash'>, incomeUuid: string, incomeDto: IncomeDto): Promise<Income> {
    const income = await this.incomeRepository.findOne({
      where: { uuid: incomeUuid, user: { uuid: user.uuid } },
    });
    if (!income) throw new IncomeNotFoundException();
    await this.incomeRepository.update(incomeUuid, {
      description: incomeDto.description,
      amount: incomeDto.amount,
      currency: { id: incomeDto.currency },
      account: { uuid: incomeDto.account },
      date: DateTime.fromISO(incomeDto.date).toJSDate(),
      fromExchangeRate: incomeDto.fromExchangeRate,
      toExchangeRate: incomeDto.toExchangeRate,
      toCurrency: { id: incomeDto.toCurrency },
    });
    return (await this.incomeRepository.findOneBy({ uuid: incomeUuid }))!;
  }

  async updateUserRecurringIncome(
    user: Omit<User, 'passwordHash'>,
    recurringIncomeUuid: string,
    recurringIncomeDto: RecurringIncomeDto
  ): Promise<RecurringIncome> {
    const recurringIncome = await this.recurringIncomeRepository.findOneBy({
      uuid: recurringIncomeUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringIncome) throw new RecurringIncomeNotFoundException();
    const nextOccurrence = rrulestr(recurringIncomeDto.recurrenceRule).after(new Date(), true);
    await this.recurringIncomeRepository.update(recurringIncomeUuid, {
      description: recurringIncomeDto.description,
      amount: recurringIncomeDto.amount,
      currency: { id: recurringIncomeDto.currency },
      account: { uuid: recurringIncomeDto.account },
      status: recurringIncomeDto.status,
      recurrenceRule: recurringIncomeDto.recurrenceRule,
      nextOccurrence,
    });
    return (await this.recurringIncomeRepository.findOneBy({ uuid: recurringIncomeUuid }))!;
  }

  async deleteUserIncome(user: Omit<User, 'passwordHash'>, incomeUuid: string): Promise<void> {
    const income = await this.incomeRepository.findOne({
      where: { uuid: incomeUuid, user: { uuid: user.uuid } },
    });
    if (!income) throw new IncomeNotFoundException();
    await this.incomeRepository.delete(incomeUuid);
  }

  async deleteUserRecurringIncome(user: Omit<User, 'passwordHash'>, recurringIncomeUuid: string): Promise<void> {
    const recurringIncome = await this.recurringIncomeRepository.findOneBy({
      uuid: recurringIncomeUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringIncome) throw new RecurringIncomeNotFoundException();
    await this.recurringIncomeRepository.delete(recurringIncomeUuid);
  }
}

