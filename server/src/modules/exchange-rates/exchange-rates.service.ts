import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';
import { OpenExchangeRateLatestResponse } from 'src/types/exchange-rates';
import { Repository } from 'typeorm';

@Injectable()
export class ExchangeRatesService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
    @InjectRepository(HistoricExchangeRate)
    private readonly historicExchangeRateRepository: Repository<HistoricExchangeRate>
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

  @Cron('0 0 */6 * * *')
  async updateExchangeRates(): Promise<number> {
    this.logger.log('Updating exchange rates...');
    const exchangeRates: OpenExchangeRateLatestResponse = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${this.configService.get<string>('OPENEXCHANGERATES_API_KEY')}`
    ).then((r) => r.json());

    const exchangeRateDate = DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate();
    const historicExchangeRate =
      (await this.historicExchangeRateRepository.findOne({
        where: { date: exchangeRateDate },
      })) ??
      this.historicExchangeRateRepository.create({
        date: DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate(),
        rates: exchangeRates.rates,
      });
    historicExchangeRate.date = DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate();
    historicExchangeRate.rates = exchangeRates.rates;
    await this.historicExchangeRateRepository.save(historicExchangeRate);

    let updatedExchangeRates: number = 0;
    for (const [code, rate] of Object.entries(exchangeRates.rates)) {
      const currency = await this.currencyRepository.findOne({ where: { code } });
      if (!currency) continue;
      const exchangeRate = await this.exchangeRateRepository.findOne({ where: { currency: { code: code } } });
      if (exchangeRate) {
        exchangeRate.rate = rate;
        exchangeRate.lastUpdated = new Date(exchangeRates.timestamp * 1000);
        await this.exchangeRateRepository.save(exchangeRate);
        updatedExchangeRates++;
      } else {
        const newExchangeRate = this.exchangeRateRepository.create({
          currency: { id: currency.id },
          rate,
        });
        await this.exchangeRateRepository.save(newExchangeRate);
        updatedExchangeRates++;
      }
    }
    this.logger.log(`${updatedExchangeRates} exchange rates updated.`);
    return updatedExchangeRates;
  }

  async getHistoricExchangeRates(date: string): Promise<HistoricExchangeRate | null> {
    const searchDate = DateTime.fromISO(date).startOf('day').toJSDate();
    return this.historicExchangeRateRepository.findOne({ where: { date: searchDate } });
  }

  async seedHistoricExchangeRates(days: number = 30) {
    this.logger.log('Seeding historic exchange rates...');
    for (let i = 0; i < days; i++) {
      const searchDate = DateTime.now()
        .startOf('day')
        .minus({ days: days - i })
        .toFormat('yyyy-MM-dd');
      const exchangeRates: OpenExchangeRateLatestResponse = await fetch(
        `https://openexchangerates.org/api/historical/${searchDate}.json?app_id=${this.configService.get<string>('OPENEXCHANGERATES_API_KEY')}`
      ).then((r) => r.json());
      const exchangeRateDate = DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate();
      const historicExchangeRate =
        (await this.historicExchangeRateRepository.findOne({
          where: { date: exchangeRateDate },
        })) ??
        this.historicExchangeRateRepository.create({
          date: DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate(),
          rates: exchangeRates.rates,
        });
      historicExchangeRate.date = DateTime.fromSeconds(exchangeRates.timestamp).startOf('day').toJSDate();
      historicExchangeRate.rates = exchangeRates.rates;
      await this.historicExchangeRateRepository.save(historicExchangeRate);
    }
    this.logger.log('Historic exchange rates seeded successfully.');
  }
}

