import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseCategoryDto } from 'src/dto/expense-categories.dto';
import { ExpenseCategory } from 'src/entities/expense-category.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>
  ) {}

  async getExpenseCategories(user: LoggedUser): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
    });
  }

  async getExpenseCategoryByUuid(user: LoggedUser, categoryUuid: string): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOne({
      where: { uuid: categoryUuid, user: { uuid: user.uuid } },
    });
    if (!category) throw new Error('Expense Category not found');
    return category;
  }

  async createExpenseCategory(user: LoggedUser, expenseCategoryDto: ExpenseCategoryDto): Promise<ExpenseCategory> {
    const newCategory = this.expenseCategoryRepository.create({
      user: { uuid: user.uuid },
      name: expenseCategoryDto.name,
      icon: expenseCategoryDto.icon,
      iconColor: expenseCategoryDto.iconColor,
      isDeleted: false,
    });
    return this.expenseCategoryRepository.save(newCategory);
  }

  async updateExpenseCategory(
    user: LoggedUser,
    categoryUuid: string,
    expenseCategoryDto: ExpenseCategoryDto
  ): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOneBy({
      uuid: categoryUuid,
      user: { uuid: user.uuid },
    });
    if (!category) throw new Error('Expense Category not found');
    await this.expenseCategoryRepository.update(categoryUuid, {
      name: expenseCategoryDto.name,
      icon: expenseCategoryDto.icon,
      iconColor: expenseCategoryDto.iconColor,
    });
    return (await this.expenseCategoryRepository.findOneBy({ uuid: categoryUuid }))!;
  }

  async deleteExpenseCategory(user: LoggedUser, categoryUuid: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findOneBy({
      uuid: categoryUuid,
      user: { uuid: user.uuid },
    });
    if (!category) throw new Error('Expense Category not found');
    await this.expenseCategoryRepository.update(categoryUuid, { isDeleted: true });
  }

  async restoreExpenseCategory(user: LoggedUser, categoryUuid: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findOneBy({
      uuid: categoryUuid,
      user: { uuid: user.uuid },
    });
    if (!category) throw new Error('Expense Category not found');
    await this.expenseCategoryRepository.update(categoryUuid, { isDeleted: false });
  }
}

