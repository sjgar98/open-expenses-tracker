import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, RecurringExpense, Income, RecurringIncome, ExchangeRate, PaymentMethod]),
  ],
  providers: [SchedulingService],
})
export class SchedulingModule {}

