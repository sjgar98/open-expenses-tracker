import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from 'src/entities/currency.entity';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async getEnabledCurrencies(): Promise<Currency[]> {
    return await this.currenciesService.getEnabledCurrencies();
  }

  @Get('all')
  async getAllCurrencies(): Promise<Currency[]> {
    return await this.currenciesService.getAllCurrencies();
  }

  @Get(':id')
  async getCurrencyById(@Param('id') id: number): Promise<Currency> {
    return await this.currenciesService.getCurrencyById(id);
  }

  @Post('new')
  async createCurrency(@Body() body: Currency): Promise<void> {
    return await this.currenciesService.createCurrency(body);
  }

  @Patch(':id')
  async updateCurrency(@Param('id') id: number, @Body() body: Partial<Currency>): Promise<void> {
    return await this.currenciesService.updateCurrency(id, body);
  }

  @Delete(':id')
  async deleteCurrency(@Param('id') id: number): Promise<void> {
    return await this.currenciesService.deleteCurrency(id);
  }
}
