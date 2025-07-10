import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>
  ) {}

  async getEnabledCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.find({ where: { status: true } });
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return this.currencyRepository.find();
  }

  async getCurrencyById(id: number): Promise<Currency> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new HttpException('Currency not found', HttpStatus.NOT_FOUND);
    }
    return currency;
  }

  async createCurrency(body: Currency): Promise<void> {
    const newCurrency = this.currencyRepository.create(body);
    await this.currencyRepository.save(newCurrency);
  }

  async updateCurrency(id: number, body: Partial<Currency>): Promise<void> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new HttpException('Currency not found', HttpStatus.NOT_FOUND);
    }
    await this.currencyRepository.update(id, body);
  }

  async deleteCurrency(id: number): Promise<void> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new HttpException('Currency not found', HttpStatus.NOT_FOUND);
    }
    await this.currencyRepository.delete(id);
  }
}
