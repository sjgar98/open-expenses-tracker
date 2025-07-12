import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';

@Controller('exchange-rates')
@UseGuards(ProtectedAuthGuard)
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get(':currencyId')
  async getExchangeRatesByCurrency(@Param('currencyId') currencyId: number) {
    return this.exchangeRatesService.getExchangeRatesByCurrency(currencyId);
  }

  @Get(':fromCurrencyId/:toCurrencyId')
  async getExchangeRateBetweenCurrencies(
    @Param('fromCurrencyId') fromCurrencyId: number,
    @Param('toCurrencyId') toCurrencyId: number
  ) {
    return this.exchangeRatesService.getExchangeRateBetweenCurrencies(fromCurrencyId, toCurrencyId);
  }
}
