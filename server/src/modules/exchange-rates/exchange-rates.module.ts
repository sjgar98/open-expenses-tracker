import { Module } from '@nestjs/common';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Currency } from 'src/entities/currency.entity';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate, Currency, HistoricExchangeRate])],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService],
})
export class ExchangeRatesModule {}

