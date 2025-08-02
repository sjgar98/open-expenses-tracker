import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Currency } from 'src/entities/currency.entity';
import { CurrencyDto, CurrencyFilterDto } from 'src/dto/currencies.dto';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginatedResults } from 'src/types/pagination';

@Controller('currencies')
@UseGuards(ProtectedAuthGuard)
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async getCurrenciesPaginated(@Query() query: CurrencyFilterDto): Promise<PaginatedResults<Currency>> {
    return this.currenciesService.getCurrenciesPaginated(query);
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
  @UseGuards(AdminGuard)
  async createCurrency(@Body() body: CurrencyDto): Promise<void> {
    return this.currenciesService.createCurrency(body);
  }

  @Put(':currencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminGuard)
  async updateCurrency(@Param('currencyId') currencyId: number, @Body() body: CurrencyDto): Promise<void> {
    return this.currenciesService.updateCurrency(currencyId, body);
  }

  @Delete(':currencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminGuard)
  async deleteCurrency(@Param('currencyId') currencyId: number): Promise<void> {
    return this.currenciesService.deleteCurrency(currencyId);
  }

  @Post('seed')
  @UseGuards(AdminGuard)
  async seedCurrencies(): Promise<number> {
    return this.currenciesService.seedCurrencies();
  }
}

