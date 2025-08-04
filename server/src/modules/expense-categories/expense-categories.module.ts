import { Module } from '@nestjs/common';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategoriesService } from './expense-categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from 'src/entities/expense-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory])],
  controllers: [ExpenseCategoriesController],
  providers: [ExpenseCategoriesService],
})
export class ExpenseCategoriesModule {}

