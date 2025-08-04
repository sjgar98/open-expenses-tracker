import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategory } from 'src/entities/expense-category.entity';
import { ExpenseCategoryDto } from 'src/dto/expense-categories.dto';

@Controller('expense-categories')
@UseGuards(ProtectedAuthGuard)
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Get()
  async getUserExpenseCategories(@Request() req): Promise<ExpenseCategory[]> {
    const userUuid: string = req.user.uuid;
    return this.expenseCategoriesService.getExpenseCategories(userUuid);
  }

  @Get(':categoryUuid')
  async getUserExpenseCategoryByUuid(
    @Request() req,
    @Param('categoryUuid') categoryUuid: string
  ): Promise<ExpenseCategory> {
    const userUuid: string = req.user.uuid;
    return this.expenseCategoriesService.getExpenseCategoryByUuid(userUuid, categoryUuid);
  }

  @Post()
  async createUserExpenseCategory(
    @Request() req,
    @Body() expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const userUuid: string = req.user.uuid;
    return this.expenseCategoriesService.createExpenseCategory(userUuid, expenseCategoryDto);
  }

  @Put(':categoryUuid')
  async updateUserExpenseCategory(
    @Request() req,
    @Param('categoryUuid') categoryUuid: string,
    @Body() expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const userUuid: string = req.user.uuid;
    return this.expenseCategoriesService.updateExpenseCategory(userUuid, categoryUuid, expenseCategoryDto);
  }

  @Delete(':categoryUuid')
  async deleteUserExpenseCategory(@Request() req, @Param('categoryUuid') categoryUuid: string): Promise<void> {
    const userUuid: string = req.user.uuid;
    return this.expenseCategoriesService.deleteExpenseCategory(userUuid, categoryUuid);
  }
}

