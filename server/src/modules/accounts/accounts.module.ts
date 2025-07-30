import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { Income } from 'src/entities/income.entity';
import { Expense } from 'src/entities/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Income, Expense])],
  providers: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}

