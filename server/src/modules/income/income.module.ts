import { Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';
import { Account } from 'src/entities/account.entity';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Income, RecurringIncome, Account, Currency, ExchangeRate])],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}

