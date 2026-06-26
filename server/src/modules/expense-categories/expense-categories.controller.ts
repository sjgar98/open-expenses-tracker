import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategory } from 'src/entities/expense-category.entity';
import { ExpenseCategoryDto } from 'src/dto/expense-categories.dto';
import { LoggedUser, User } from 'src/entities/user.entity';

@Controller('expense-categories')
@UseGuards(ProtectedAuthGuard)
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Get()
  async getUserExpenseCategories(@Request() req): Promise<ExpenseCategory[]> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.getExpenseCategories(user);
  }

  @Get(':categoryUuid')
  async getUserExpenseCategoryByUuid(
    @Request() req,
    @Param('categoryUuid') categoryUuid: string
  ): Promise<ExpenseCategory> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.getExpenseCategoryByUuid(user, categoryUuid);
  }

  @Post()
  async createUserExpenseCategory(
    @Request() req,
    @Body() expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.createExpenseCategory(user, expenseCategoryDto);
  }

  @Put(':categoryUuid')
  async updateUserExpenseCategory(
    @Request() req,
    @Param('categoryUuid') categoryUuid: string,
    @Body() expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.updateExpenseCategory(user, categoryUuid, expenseCategoryDto);
  }

  @Delete(':categoryUuid')
  async deleteUserExpenseCategory(@Request() req, @Param('categoryUuid') categoryUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.deleteExpenseCategory(user, categoryUuid);
  }

  @Patch(':categoryUuid/restore')
  async restoreUserExpenseCategory(@Request() req, @Param('categoryUuid') categoryUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.expenseCategoriesService.restoreExpenseCategory(user, categoryUuid);
  }
}

