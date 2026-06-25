import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsService } from './savings.service';
import { Saving } from 'src/entities/saving.entity';
import { Currency } from 'src/entities/currency.entity';
import { SavingsBucket } from 'src/entities/savings-bucket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Saving, Currency, SavingsBucket])],
  controllers: [SavingsController],
  providers: [SavingsService],
})
export class SavingsModule {}

