import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatchCurrencyDto, PostCurrencyDto } from 'src/dto/currencies.dto';
import { Currency } from 'src/entities/currency.entity';
import {
  CurrencyAlreadyExistsException,
  CurrencyInvalidCodeException,
  CurrencyNotFoundException,
} from 'src/exceptions/currencies.exceptions';
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
      throw new CurrencyNotFoundException();
    }
    return currency;
  }

  async createCurrency(body: PostCurrencyDto): Promise<void> {
    const existingCurrency = await this.currencyRepository.findOneBy({ code: body.code });
    if (existingCurrency) throw new CurrencyAlreadyExistsException();
    if (!/^[A-Z]{3}$/.test(body.code)) throw new CurrencyInvalidCodeException();
    const newCurrency = this.currencyRepository.create(body);
    await this.currencyRepository.save(newCurrency);
  }

  async updateCurrency(id: number, body: PatchCurrencyDto): Promise<void> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    await this.currencyRepository.update(id, body);
  }

  async deleteCurrency(id: number): Promise<void> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    await this.currencyRepository.delete(id);
  }
}
