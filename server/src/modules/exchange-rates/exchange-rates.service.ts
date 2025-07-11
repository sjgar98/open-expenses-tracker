import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  async getExchangeRatesByCurrency(currencyId: number): Promise<ExchangeRate[]> {
    return this.exchangeRateRepository.find({ where: { fromCurrency: { id: currencyId } } });
  }

  async getExchangeRateBetweenCurrencies(fromCurrencyId: number, toCurrencyId: number): Promise<ExchangeRate | null> {
    const exchangeRate = await this.exchangeRateRepository.findOne({
      where: [
        {
          fromCurrency: { id: fromCurrencyId },
          toCurrency: { id: toCurrencyId },
        },
      ],
    });

    if (exchangeRate) {
      return exchangeRate;
    } else {
      // If no direct exchange rate is found, you might want to handle it differently
      // For example, you could throw an exception or return null
      // throw new CurrencyNotFoundException();
      return null;
    }
  }
}
