import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { ExpensesService } from './expenses.service';
import { Expense } from 'src/entities/expense.entity';
import { User } from 'src/entities/user.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { ExpenseDto, ExpenseFilterDto, RecurringExpenseDto, RecurringExpenseFilterDto } from 'src/dto/expenses.dto';
import { PaginatedResults } from 'src/types/pagination';

@Controller('expenses')
@UseGuards(ProtectedAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('onetime')
  async getUserExpenses(@Request() req, @Query() query: ExpenseFilterDto): Promise<PaginatedResults<Expense>> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserExpenses(user, query);
  }

  @Get('onetime/:expenseUuid')
  async getUserExpenseByUuid(@Request() req, @Param('expenseUuid') expenseUuid: string): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserExpenseByUuid(user, expenseUuid);
  }

  @Post('onetime')
  async createUserExpense(@Request() req, @Body() expenseDto: ExpenseDto): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserExpense(user, expenseDto);
  }

  @Put('onetime/:expenseUuid')
  async updateUserExpense(
    @Request() req,
    @Param('expenseUuid') expenseUuid: string,
    @Body() expenseDto: ExpenseDto
  ): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.updateUserExpense(user, expenseUuid, expenseDto);
  }

  @Delete('onetime/:expenseUuid')
  async deleteUserExpense(@Request() req, @Param('expenseUuid') expenseUuid: string): Promise<void> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.deleteUserExpense(user, expenseUuid);
  }

  @Get('recurring')
  async getUserRecurringExpenses(
    @Request() req,
    @Query() query: RecurringExpenseFilterDto
  ): Promise<PaginatedResults<RecurringExpense>> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserRecurringExpenses(user, query);
  }

  @Get('recurring/:recurringExpenseUuid')
  async getUserRecurringExpenseByUuid(
    @Request() req,
    @Param('recurringExpenseUuid') recurringExpenseUuid: string
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.getUserRecurringExpenseByUuid(user, recurringExpenseUuid);
  }

  @Post('recurring')
  async createUserRecurringExpense(
    @Request() req,
    @Body() recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserRecurringExpense(user, recurringExpenseDto);
  }

  @Put('recurring/:recurringExpenseUuid')
  async updateUserRecurringExpense(
    @Request() req,
    @Param('recurringExpenseUuid') recurringExpenseUuid: string,
    @Body() recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.updateUserRecurringExpense(user, recurringExpenseUuid, recurringExpenseDto);
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

