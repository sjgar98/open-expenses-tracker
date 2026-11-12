import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, RecurringExpense, Income, RecurringIncome, PaymentMethod])],
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}

