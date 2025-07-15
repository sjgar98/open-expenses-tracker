import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, RecurringExpense])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}

