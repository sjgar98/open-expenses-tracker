import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from 'src/entities/currency.entity';
import { PatchCurrencyDto, PostCurrencyDto } from 'src/dto/currencies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('currencies')
@UseGuards(JwtAuthGuard)
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async getEnabledCurrencies(): Promise<Currency[]> {
    return this.currenciesService.getEnabledCurrencies();
  }

  @Get('all')
  async getAllCurrencies(): Promise<Currency[]> {
    return this.currenciesService.getAllCurrencies();
  }

  @Get(':currencyId')
  async getCurrencyById(@Param('currencyId') currencyId: number): Promise<Currency> {
    return this.currenciesService.getCurrencyById(currencyId);
  }

  @Post('new')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createCurrency(@Body() body: PostCurrencyDto): Promise<void> {
    return this.currenciesService.createCurrency(body);
  }

  @Patch(':currencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCurrency(@Param('currencyId') currencyId: number, @Body() body: PatchCurrencyDto): Promise<void> {
    return this.currenciesService.updateCurrency(currencyId, body);
  }

  @Delete(':currencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCurrency(@Param('currencyId') currencyId: number): Promise<void> {
    return this.currenciesService.deleteCurrency(currencyId);
  }
}
