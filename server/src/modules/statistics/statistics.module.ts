import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from 'src/entities/expense.entity';
import { Income } from 'src/entities/income.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { RecurringExpense } from 'src/entities/recurring-expense.entity';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';
import { User } from 'src/entities/user.entity';
import { UserSettings } from 'src/entities/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Income,
      PaymentMethod,
      ExchangeRate,
      RecurringExpense,
      HistoricExchangeRate,
      User,
      UserSettings,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}

