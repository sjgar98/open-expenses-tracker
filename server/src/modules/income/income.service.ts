import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rrulestr } from 'rrule';
import { PatchIncomeDto, PatchRecurringIncomeDto, PostIncomeDto, PostRecurringIncomeDto } from 'src/dto/income.dto';
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

  async createUserIncome(user: Omit<User, 'passwordHash'>, postIncomeDto: PostIncomeDto): Promise<Income> {
    const newIncome = this.incomeRepository.create({
      user: { uuid: user.uuid },
      description: postIncomeDto.description,
      amount: postIncomeDto.amount,
      currency: { id: postIncomeDto.currency },
      account: { uuid: postIncomeDto.account },
      date: postIncomeDto.date,
    });
    return this.incomeRepository.save(newIncome);
  }

  async createUserRecurringIncome(
    user: Omit<User, 'passwordHash'>,
    postRecurringIncomeDto: PostRecurringIncomeDto
  ): Promise<RecurringIncome> {
    const nextOccurrence = rrulestr(postRecurringIncomeDto.recurrenceRule).after(new Date(), true);
    const newRecurringIncome = this.recurringIncomeRepository.create({
      user: { uuid: user.uuid },
      description: postRecurringIncomeDto.description,
      amount: postRecurringIncomeDto.amount,
      currency: { id: postRecurringIncomeDto.currency },
      account: { uuid: postRecurringIncomeDto.account },
      status: postRecurringIncomeDto.status,
      startDate: postRecurringIncomeDto.startDate,
      recurrenceRule: postRecurringIncomeDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringIncomeRepository.save(newRecurringIncome);
  }

  async updateUserIncome(
    user: Omit<User, 'passwordHash'>,
    incomeUuid: string,
    patchIncomeDto: PatchIncomeDto
  ): Promise<Income> {
    const income = await this.incomeRepository.findOneBy({ uuid: incomeUuid, user: { uuid: user.uuid } });
    if (!income) throw new IncomeNotFoundException();
    await this.incomeRepository.update(incomeUuid, {
      description: patchIncomeDto.description,
      amount: patchIncomeDto.amount,
      currency: { id: patchIncomeDto.currency },
      account: { uuid: patchIncomeDto.account },
      date: patchIncomeDto.date,
    });
    return (await this.incomeRepository.findOneBy({ uuid: incomeUuid }))!;
  }

  async updateUserRecurringIncome(
    user: Omit<User, 'passwordHash'>,
    recurringIncomeUuid: string,
    patchRecurringIncomeDto: PatchRecurringIncomeDto
  ): Promise<RecurringIncome> {
    const recurringIncome = await this.recurringIncomeRepository.findOneBy({
      uuid: recurringIncomeUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringIncome) throw new RecurringIncomeNotFoundException();
    const nextOccurrence = patchRecurringIncomeDto.recurrenceRule
      ? rrulestr(patchRecurringIncomeDto.recurrenceRule).after(new Date(), true)
      : recurringIncome.nextOccurrence;
    await this.recurringIncomeRepository.update(recurringIncomeUuid, {
      description: patchRecurringIncomeDto.description,
      amount: patchRecurringIncomeDto.amount,
      currency: patchRecurringIncomeDto.currency ? { id: patchRecurringIncomeDto.currency } : undefined,
      account: patchRecurringIncomeDto.account ? { uuid: patchRecurringIncomeDto.account } : undefined,
      status: patchRecurringIncomeDto.status,
      startDate: patchRecurringIncomeDto.startDate,
      recurrenceRule: patchRecurringIncomeDto.recurrenceRule,
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
