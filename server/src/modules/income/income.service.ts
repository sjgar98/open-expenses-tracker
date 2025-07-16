import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rrulestr } from 'rrule';
import { IncomeDto, RecurringIncomeDto } from 'src/dto/income.dto';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { User } from 'src/entities/user.entity';
import { IncomeNotFoundException, RecurringIncomeNotFoundException } from 'src/exceptions/income.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(RecurringIncome)
    private readonly recurringIncomeRepository: Repository<RecurringIncome>
  ) {}

  async getUserIncome(user: Omit<User, 'passwordHash'>): Promise<Income[]> {
    return this.incomeRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async getUserRecurringIncome(user: Omit<User, 'passwordHash'>): Promise<RecurringIncome[]> {
    return this.recurringIncomeRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async createUserIncome(user: Omit<User, 'passwordHash'>, incomeDto: IncomeDto): Promise<Income> {
    const newIncome = this.incomeRepository.create({
      user: { uuid: user.uuid },
      description: incomeDto.description,
      amount: incomeDto.amount,
      currency: { id: incomeDto.currency },
      account: { uuid: incomeDto.account },
      date: incomeDto.date,
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
      startDate: recurringIncomeDto.startDate,
      recurrenceRule: recurringIncomeDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringIncomeRepository.save(newRecurringIncome);
  }

  async updateUserIncome(user: Omit<User, 'passwordHash'>, incomeUuid: string, incomeDto: IncomeDto): Promise<Income> {
    const income = await this.incomeRepository.findOneBy({ uuid: incomeUuid, user: { uuid: user.uuid } });
    if (!income) throw new IncomeNotFoundException();
    await this.incomeRepository.update(incomeUuid, {
      description: incomeDto.description,
      amount: incomeDto.amount,
      currency: { id: incomeDto.currency },
      account: { uuid: incomeDto.account },
      date: incomeDto.date,
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
      startDate: recurringIncomeDto.startDate,
      recurrenceRule: recurringIncomeDto.recurrenceRule,
      nextOccurrence,
    });
    return (await this.recurringIncomeRepository.findOneBy({ uuid: recurringIncomeUuid }))!;
  }

  async deleteUserIncome(user: Omit<User, 'passwordHash'>, incomeUuid: string): Promise<void> {
    const income = await this.incomeRepository.findOneBy({ uuid: incomeUuid, user: { uuid: user.uuid } });
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
