import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rrulestr } from 'rrule';
import {
  PatchExpenseDto,
  PatchRecurringExpenseDto,
  PostExpenseDto,
  PostRecurringExpenseDto,
} from 'src/dto/expenses.dto';
import { Expense } from 'src/entities/expense.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { User } from 'src/entities/user.entity';
import { ExpenseNotFoundException, RecurringExpenseNotFoundException } from 'src/exceptions/expenses.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(RecurringExpense)
    private readonly recurringExpenseRepository: Repository<RecurringExpense>
  ) {}

  async getUserExpenses(user: Omit<User, 'passwordHash'>): Promise<Expense[]> {
    return this.expenseRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async getUserRecurringExpenses(user: Omit<User, 'passwordHash'>): Promise<RecurringExpense[]> {
    return this.recurringExpenseRepository.find({ where: { user: { uuid: user.uuid } } });
  }

  async createUserExpense(user: Omit<User, 'passwordHash'>, postExpenseDto: PostExpenseDto): Promise<Expense> {
    const newExpense = this.expenseRepository.create({
      user: { uuid: user.uuid },
      description: postExpenseDto.description,
      amount: postExpenseDto.amount,
      currency: { id: postExpenseDto.currency },
      paymentMethod: { uuid: postExpenseDto.paymentMethod },
      taxes: postExpenseDto.taxes.map((uuid) => ({ uuid })),
      date: postExpenseDto.date,
    });
    return this.expenseRepository.save(newExpense);
  }

  async createUserRecurringExpense(
    user: Omit<User, 'passwordHash'>,
    postRecurringExpenseDto: PostRecurringExpenseDto
  ): Promise<RecurringExpense> {
    const nextOccurrence = rrulestr(postRecurringExpenseDto.recurrenceRule).after(new Date(), true);
    const newRecurringExpense = this.recurringExpenseRepository.create({
      user: { uuid: user.uuid },
      description: postRecurringExpenseDto.description,
      amount: postRecurringExpenseDto.amount,
      currency: { id: postRecurringExpenseDto.currency },
      paymentMethod: { uuid: postRecurringExpenseDto.paymentMethod },
      status: postRecurringExpenseDto.status,
      startDate: postRecurringExpenseDto.startDate,
      recurrenceRule: postRecurringExpenseDto.recurrenceRule,
      nextOccurrence,
    });
    return this.recurringExpenseRepository.save(newRecurringExpense);
  }

  async updateUserExpense(
    user: Omit<User, 'passwordHash'>,
    expenseUuid: string,
    patchExpenseDto: PatchExpenseDto
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findOneBy({ uuid: expenseUuid, user: { uuid: user.uuid } });
    if (!expense) throw new ExpenseNotFoundException();
    await this.expenseRepository.update(expenseUuid, {
      description: patchExpenseDto.description,
      amount: patchExpenseDto.amount,
      currency: patchExpenseDto.currency ? { id: patchExpenseDto.currency } : undefined,
      paymentMethod: patchExpenseDto.paymentMethod ? { uuid: patchExpenseDto.paymentMethod } : undefined,
      taxes: patchExpenseDto.taxes?.map((uuid) => ({ uuid })),
      date: patchExpenseDto.date,
    });
    return (await this.expenseRepository.findOneBy({ uuid: expenseUuid }))!;
  }

  async updateUserRecurringExpense(
    user: Omit<User, 'passwordHash'>,
    recurringExpenseUuid: string,
    patchRecurringExpenseDto: PatchRecurringExpenseDto
  ): Promise<RecurringExpense> {
    const recurringExpense = await this.recurringExpenseRepository.findOneBy({
      uuid: recurringExpenseUuid,
      user: { uuid: user.uuid },
    });
    if (!recurringExpense) throw new RecurringExpenseNotFoundException();
    const nextOccurrence = patchRecurringExpenseDto.recurrenceRule
      ? rrulestr(patchRecurringExpenseDto.recurrenceRule).after(new Date(), true)
      : undefined;
    await this.recurringExpenseRepository.update(recurringExpenseUuid, {
      description: patchRecurringExpenseDto.description,
      amount: patchRecurringExpenseDto.amount,
      currency: patchRecurringExpenseDto.currency ? { id: patchRecurringExpenseDto.currency } : undefined,
      paymentMethod: patchRecurringExpenseDto.paymentMethod
        ? { uuid: patchRecurringExpenseDto.paymentMethod }
        : undefined,
      status: patchRecurringExpenseDto.status,
      startDate: patchRecurringExpenseDto.startDate,
      recurrenceRule: patchRecurringExpenseDto.recurrenceRule,
      nextOccurrence,
    });
    return (await this.recurringExpenseRepository.findOneBy({ uuid: recurringExpenseUuid }))!;
  }

  async deleteUserExpense(user: Omit<User, 'passwordHash'>, expenseUuid: string): Promise<void> {
    const expense = await this.expenseRepository.findOneBy({ uuid: expenseUuid, user: { uuid: user.uuid } });
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
