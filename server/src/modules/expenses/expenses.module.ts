import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { Currency } from 'src/entities/currency.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, RecurringExpense, Currency, PaymentMethod])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}

