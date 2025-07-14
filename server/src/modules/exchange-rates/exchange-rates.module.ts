import { Module } from '@nestjs/common';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Currency } from 'src/entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate, Currency])],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService],
})
export class ExchangeRatesModule {}

