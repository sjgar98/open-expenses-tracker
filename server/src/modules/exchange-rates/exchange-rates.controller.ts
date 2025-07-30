import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('exchange-rates')
@UseGuards(ProtectedAuthGuard)
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  async getAllExchangeRates() {
    return this.exchangeRatesService.getAllExchangeRates();
  }

  @Get(':currencyCode')
  async getExchangeRatesByCurrency(@Param('currencyCode') currencyCode: string) {
    return this.exchangeRatesService.getExchangeRateByCurrencyCode(currencyCode);
  }

  @Post('update')
  @UseGuards(AdminGuard)
  async updateExchangeRates(): Promise<number> {
    return this.exchangeRatesService.updateExchangeRates();
  }
}

