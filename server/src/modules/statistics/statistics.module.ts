import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income, PaymentMethod, ExchangeRate, RecurringExpense])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

