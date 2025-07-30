import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { OpenExchangeRateLatestResponse } from 'src/types/exchange-rates';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeRatesService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>
  ) {}

  private readonly logger = new Logger(ExchangeRatesService.name);

  async getAllExchangeRates() {
    return this.exchangeRateRepository.find({
      where: { currency: { visible: true } },
      relations: ['currency'],
    });
  }

  async getExchangeRateByCurrencyCode(code: string) {
    return this.exchangeRateRepository.findOne({
      where: { currency: { code } },
      relations: ['currency'],
    });
  }

  @Cron('0 0 * * *')
  async updateExchangeRates(): Promise<number> {
    this.logger.log('Updating exchange rates...');
    const exchangeRates: OpenExchangeRateLatestResponse = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${this.configService.get<string>('OPENEXCHANGERATES_API_KEY')}`
    ).then((r) => r.json());
    let updatedExchangeRates: number = 0;
    for (const [code, rate] of Object.entries(exchangeRates.rates)) {
      const currency = await this.currencyRepository.findOne({
        where: { code },
      });
      if (!currency) continue;
      const exchangeRate = await this.exchangeRateRepository.findOne({
        where: { currency: { code: code } },
      });
      if (exchangeRate) {
        exchangeRate.rate = rate;
        exchangeRate.lastUpdated = new Date(exchangeRates.timestamp * 1000);
        await this.exchangeRateRepository.save(exchangeRate);
        updatedExchangeRates++;
      } else {
        const newExchangeRate = this.exchangeRateRepository.create({
          currency: { id: currency.id },
          rate,
          lastUpdated: new Date(exchangeRates.timestamp * 1000),
        });
        await this.exchangeRateRepository.save(newExchangeRate);
        updatedExchangeRates++;
      }
    }
    this.logger.log(`${updatedExchangeRates} exchange rates updated.`);
    return updatedExchangeRates;
  }
}

