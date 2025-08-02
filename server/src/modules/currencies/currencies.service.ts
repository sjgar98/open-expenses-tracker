import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyDto, CurrencyFilterDto } from 'src/dto/currencies.dto';
import { Currency } from 'src/entities/currency.entity';
import { CurrencyAlreadyExistsException, CurrencyInvalidCodeException, CurrencyNotFoundException, } from 'src/exceptions/currencies.exceptions';
import { PaginatedResults } from 'src/types/pagination';
import { Repository } from 'typeorm';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>
  ) {}

  private readonly logger = new Logger(CurrenciesService.name);

  async getCurrenciesPaginated(query: CurrencyFilterDto): Promise<PaginatedResults<Currency>> {
    const { page, pageSize, sortBy, sortOrder } = query;
    const [result, total] = await this.currencyRepository.findAndCount({
      order: { [sortBy]: sortOrder },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items: result, totalCount: total, pageSize: pageSize, currentPage: page };
  }

  async getAllCurrencies(): Promise<Currency[]> {
    return await this.currencyRepository.find();
  }

  async getCurrencyById(id: number): Promise<Currency> {
    const currency = await this.currencyRepository.findOneBy({ id });
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    return currency;
  }

  async getCurrencyByCode(code: string): Promise<Currency | null> {
    const currency = this.currencyRepository.findOneBy({ code });
    if (!currency) {
      throw new CurrencyNotFoundException();
    }
    return currency;
  }

  async createCurrency(body: CurrencyDto): Promise<void> {
    const existingCurrency = await this.currencyRepository.findOneBy({ code: body.code });
    if (existingCurrency) throw new CurrencyAlreadyExistsException();
    if (!/^[A-Z]{3}$/.test(body.code)) throw new CurrencyInvalidCodeException();
    const newCurrency = this.currencyRepository.create(body);
    await this.currencyRepository.save(newCurrency);
  }

  async updateCurrency(id: number, body: CurrencyDto): Promise<void> {
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

  async seedCurrencies(): Promise<number> {
    this.logger.log('Fetching currencies...');
    const currenciesFromApi = await fetch('https://openexchangerates.org/api/currencies.json')
      .then((r) => r.json())
      .then((data) => Object.entries(data).map(([code, name]: [string, string]) => ({ code, name })));
    let seededCurrencies: number = 0;
    for (const { code, name } of currenciesFromApi) {
      const existingCurrency = await this.getCurrencyByCode(code);
      if (!existingCurrency) {
        await this.createCurrency({ code, name, visible: code === 'USD' });
        seededCurrencies++;
      }
    }
    this.logger.log(`${seededCurrencies} currencies added.`);
    return seededCurrencies;
  }
}

