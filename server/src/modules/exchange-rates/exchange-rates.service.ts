import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Currency } from 'src/entities/currency.entity';
import { ExchangeRate } from 'src/entities/exchange-rate.entity';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';
import { OpenExchangeRateLatestResponse } from 'src/types/exchange-rates';
import { In, Not, Repository } from 'typeorm';
import * as lodash from 'lodash';

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
    const exchangeRatesApi: OpenExchangeRateLatestResponse = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${this.configService.get<string>('OPENEXCHANGERATES_API_KEY')}`
    ).then((r) => r.json());

    const exchangeRateDate = DateTime.fromSeconds(exchangeRatesApi.timestamp).startOf('day').toJSDate();
    const historicExchangeRate =
      (await this.historicExchangeRateRepository.findOne({
        where: { date: exchangeRateDate },
      })) ??
      this.historicExchangeRateRepository.create({
        date: DateTime.fromSeconds(exchangeRatesApi.timestamp).startOf('day').toJSDate(),
        rates: exchangeRatesApi.rates,
      });
    historicExchangeRate.date = DateTime.fromSeconds(exchangeRatesApi.timestamp).startOf('day').toJSDate();
    historicExchangeRate.rates = exchangeRatesApi.rates;

    let updatedExchangeRates: number = 0;
    for (const [code, rate] of Object.entries(exchangeRatesApi.rates)) {
      const currency = await this.currencyRepository.findOne({ where: { code } });
      if (!currency) continue;

      let newRate = rate;
      if (currency.customExchangeRateApiUrl && currency.customExchangeRateApiPath) {
        newRate = await fetch(currency.customExchangeRateApiUrl)
          .then((response) => response.json())
          .then((data) => lodash.get(data, currency.customExchangeRateApiPath!, rate))
          .catch(() => rate);
        historicExchangeRate.rates[code] = newRate;
      }
      const exchangeRate =
        (await this.exchangeRateRepository.findOne({ where: { currency: { code: code } } })) ??
        this.exchangeRateRepository.create({ currency: { id: currency.id }, rate: newRate });
      exchangeRate.rate = newRate;
      exchangeRate.lastUpdated = new Date(exchangeRatesApi.timestamp * 1000);
      await this.exchangeRateRepository.save(exchangeRate);
      updatedExchangeRates++;
    }

    const missingCurrencies = await this.currencyRepository.find({
      where: { code: Not(In(Object.keys(exchangeRatesApi.rates))) },
    });
    for (const currency of missingCurrencies) {
      let newRate = 1;
      if (currency.customExchangeRateApiUrl && currency.customExchangeRateApiPath) {
        newRate = await fetch(currency.customExchangeRateApiUrl)
          .then((response) => response.json())
          .then((data) => lodash.get(data, currency.customExchangeRateApiPath!, 1))
          .catch(() => 1);
        historicExchangeRate.rates[currency.code] = newRate;
      }
      const exchangeRate =
        (await this.exchangeRateRepository.findOne({ where: { currency: { code: currency.code } } })) ??
        this.exchangeRateRepository.create({ currency: { id: currency.id }, rate: newRate });
      exchangeRate.rate = newRate;
      exchangeRate.lastUpdated = new Date();
      await this.exchangeRateRepository.save(exchangeRate);
      updatedExchangeRates++;
    }

    await this.historicExchangeRateRepository.save(historicExchangeRate);
    this.logger.log(`${updatedExchangeRates} exchange rates updated.`);
    return updatedExchangeRates;
  }

  async getHistoricExchangeRates(date: string): Promise<Record<string, number>> {
    const searchDate = DateTime.fromISO(date).startOf('day').toJSDate();
    const result = await this.historicExchangeRateRepository.findOne({ where: { date: searchDate } });
    return result?.rates ?? {};
  }

  async updateHistoricExchangeRates(date: string, rates: Record<string, number>): Promise<void> {
    const searchDate = DateTime.fromISO(date).startOf('day').toJSDate();
    const historicExchangeRate =
      (await this.historicExchangeRateRepository.findOne({ where: { date: searchDate } })) ??
      this.historicExchangeRateRepository.create({ date: searchDate, rates });
    historicExchangeRate.rates = rates;
    await this.historicExchangeRateRepository.save(historicExchangeRate);
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

