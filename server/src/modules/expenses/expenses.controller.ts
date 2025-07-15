import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { ExpensesService } from './expenses.service';
import { Expense } from 'src/entities/expense.entity';
import { User } from 'src/entities/user.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import {
  PatchExpenseDto,
  PatchRecurringExpenseDto,
  PostExpenseDto,
  PostRecurringExpenseDto,
} from 'src/dto/expenses.dto';

@Controller('expenses')
@UseGuards(ProtectedAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async getUserExpenses(@Request() req): Promise<Expense[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserExpenses(user);
  }

  @Get('recurring')
  async getUserRecurringExpenses(@Request() req): Promise<RecurringExpense[]> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserRecurringExpenses(user);
  }

  @Post()
  async createUserExpense(@Request() req, @Body() postExpenseDto: PostExpenseDto): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserExpense(user, postExpenseDto);
  }

  @Post('recurring')
  async createUserRecurringExpense(
    @Request() req,
    @Body() recurringExpenseDto: PostRecurringExpenseDto
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserRecurringExpense(user, recurringExpenseDto);
  }

  @Patch(':expenseUuid')
  async updateUserExpense(
    @Request() req,
    @Param('expenseUuid') expenseUuid: string,
    @Body() patchExpenseDto: PatchExpenseDto
  ): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.updateUserExpense(user, expenseUuid, patchExpenseDto);
  }

  @Patch('recurring/:recurringExpenseUuid')
  async updateUserRecurringExpense(
    @Request() req,
    @Param('recurringExpenseUuid') recurringExpenseUuid: string,
    @Body() patchRecurringExpenseDto: PatchRecurringExpenseDto
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.updateUserRecurringExpense(user, recurringExpenseUuid, patchRecurringExpenseDto);
  }

  @Delete(':expenseUuid')
  async deleteUserExpense(@Request() req, @Param('expenseUuid') expenseUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.deleteUserExpense(user, expenseUuid);
  }

  @Delete('recurring/:recurringExpenseUuid')
  async deleteUserRecurringExpense(
    @Request() req,
    @Param('recurringExpenseUuid') recurringExpenseUuid: string
  ): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.deleteUserRecurringExpense(user, recurringExpenseUuid);
  }
}
