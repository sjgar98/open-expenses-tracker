import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { SavingDto, SavingFilterDto } from 'src/dto/savings.dto';
import { Currency } from 'src/entities/currency.entity';
import { Saving } from 'src/entities/saving.entity';
import { SavingsBucket } from 'src/entities/savings-bucket.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { CurrencyNotFoundException } from 'src/exceptions/currencies.exceptions';
import { SavingNotFoundException } from 'src/exceptions/savings.exceptions';
import { PaginatedResults } from 'src/types/pagination';
import { Between, ILike, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(Saving)
    private readonly savingRepository: Repository<Saving>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(SavingsBucket)
    private readonly savingsBucketRepository: Repository<SavingsBucket>
  ) {}

  async getUserSavings(user: LoggedUser, query: SavingFilterDto): Promise<PaginatedResults<Saving>> {
    const { page, pageSize, sortBy, sortOrder, rangeStart, rangeEnd, searchTerm, bucket } = query;
    const [result, total] = await this.savingRepository.findAndCount({
      where: {
        user: { uuid: user.uuid },
        description: searchTerm ? ILike(`%${searchTerm}%`) : undefined,
        date: rangeStart
          ? rangeEnd
            ? Between(new Date(rangeStart), new Date(rangeEnd))
            : MoreThanOrEqual(new Date(rangeStart))
          : rangeEnd
            ? LessThanOrEqual(new Date(rangeEnd))
            : undefined,
        bucket: bucket ? { uuid: bucket } : undefined,
      },
      order: { [sortBy]: sortOrder },
      relations: ['currency', 'bucket'],
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { items: result, totalCount: total, pageSize: pageSize, currentPage: page };
  }

  async getUserSavingsBuckets(user: LoggedUser): Promise<SavingsBucket[]> {
    const bucketUuids = await this.savingRepository
      .createQueryBuilder('saving')
      .where('saving.userUuid = :userUuid', { userUuid: user.uuid })
      .distinctOn(['saving.bucket'])
      .select('saving.bucket', 'bucket')
      .getRawMany()
      .then((results) => results.map((result) => result.bucket));
    return this.savingsBucketRepository.find({
      where: { uuid: In(bucketUuids) },
      order: { name: 'ASC' },
    });
  }

  async getUserSavingByUuid(user: LoggedUser, savingUuid: string): Promise<Saving> {
    const saving = await this.savingRepository.findOne({
      where: { uuid: savingUuid, user: { uuid: user.uuid } },
      relations: ['currency', 'bucket'],
    });
    if (!saving) throw new SavingNotFoundException();
    return saving;
  }

  async createUserSaving(user: LoggedUser, savingDto: SavingDto): Promise<Saving> {
    const savingCurrency = await this.currencyRepository.findOne({ where: { id: savingDto.currency } });
    if (!savingCurrency) throw new CurrencyNotFoundException();
    const bucket = savingDto.bucket
      ? await this.savingsBucketRepository.findOne({ where: { uuid: savingDto.bucket }, relations: ['currency'] })
      : null;
    if (savingDto.bucket && !bucket) throw new SavingNotFoundException();
    const newSaving = this.savingRepository.create({
      user: { uuid: user.uuid },
      description: savingDto.description,
      amount: savingDto.amount,
      currency: { id: savingDto.currency },
      bucket: { uuid: savingDto.bucket },
      date: DateTime.fromISO(savingDto.date).toJSDate(),
    });
    return this.savingRepository.save(newSaving);
  }

  async updateUserSaving(user: LoggedUser, savingUuid: string, savingDto: SavingDto): Promise<Saving> {
    const saving = await this.savingRepository.findOneBy({ uuid: savingUuid, user: { uuid: user.uuid } });
    if (!saving) throw new SavingNotFoundException();
    Object.assign(saving, {
      description: savingDto.description,
      amount: savingDto.amount,
      currency: { id: savingDto.currency },
      bucket: { uuid: savingDto.bucket },
      date: DateTime.fromISO(savingDto.date).toJSDate(),
    });
    return this.savingRepository.save(saving);
  }

  async deleteUserSaving(user: LoggedUser, savingUuid: string): Promise<void> {
    const saving = await this.savingRepository.findOneBy({ uuid: savingUuid, user: { uuid: user.uuid } });
    if (!saving) throw new SavingNotFoundException();
    await this.savingRepository.remove(saving);
  }
}

