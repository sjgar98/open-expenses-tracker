import { Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from 'src/entities/income.entity';
import { RecurringIncome } from 'src/entities/recurring-income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Income, RecurringIncome])],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}

