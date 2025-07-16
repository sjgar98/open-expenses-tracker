import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { ExpensesService } from './expenses.service';
import { Expense } from 'src/entities/expense.entity';
import { User } from 'src/entities/user.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { ExpenseDto, RecurringExpenseDto } from 'src/dto/expenses.dto';

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
  async createUserExpense(@Request() req, @Body() expenseDto: ExpenseDto): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserExpense(user, expenseDto);
  }

  @Post('recurring')
  async createUserRecurringExpense(
    @Request() req,
    @Body() recurringExpenseDto: RecurringExpenseDto
  ): Promise<RecurringExpense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.createUserRecurringExpense(user, recurringExpenseDto);
  }

  @Put(':expenseUuid')
  async updateUserExpense(
    @Request() req,
    @Param('expenseUuid') expenseUuid: string,
    @Body() expenseDto: ExpenseDto
  ): Promise<Expense> {
    const user: Omit<User, 'passwordHash'> = req.user;
    return this.expensesService.updateUserExpense(user, expenseUuid, expenseDto);
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
