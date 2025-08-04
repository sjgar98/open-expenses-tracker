import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseCategoryDto } from 'src/dto/expense-categories.dto';
import { ExpenseCategory } from 'src/entities/expense-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>
  ) {}

  async getExpenseCategories(userUuid: string): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.find({ where: { user: { uuid: userUuid }, isDeleted: false } });
  }

  async getExpenseCategoryByUuid(userUuid: string, categoryUuid: string): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOne({
      where: { uuid: categoryUuid, user: { uuid: userUuid } },
    });
    if (!category) throw new Error('Expense Category not found');
    return category;
  }

  async createExpenseCategory(userUuid: string, expenseCategoryDto: ExpenseCategoryDto): Promise<ExpenseCategory> {
    const newCategory = this.expenseCategoryRepository.create({
      user: { uuid: userUuid },
      name: expenseCategoryDto.name,
      icon: expenseCategoryDto.icon,
      iconColor: expenseCategoryDto.iconColor,
      isDeleted: false,
    });
    return this.expenseCategoryRepository.save(newCategory);
  }

  async updateExpenseCategory(
    userUuid: string,
    categoryUuid: string,
    expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOneBy({
      uuid: categoryUuid,
      user: { uuid: userUuid },
    });
    if (!category) throw new Error('Expense Category not found');
    await this.expenseCategoryRepository.update(categoryUuid, {
      name: expenseCategoryDto.name,
      icon: expenseCategoryDto.icon,
      iconColor: expenseCategoryDto.iconColor,
    });
    return (await this.expenseCategoryRepository.findOneBy({ uuid: categoryUuid }))!;
  }

  async deleteExpenseCategory(userUuid: string, categoryUuid: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findOneBy({
      uuid: categoryUuid,
      user: { uuid: userUuid },
    });
    if (!category) throw new Error('Expense Category not found');
    await this.expenseCategoryRepository.update(categoryUuid, { isDeleted: true });
  }
}

