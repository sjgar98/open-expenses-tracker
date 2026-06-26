import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { SavingsBucketDto } from 'src/dto/savings-buckets.dto';
import { HistoricExchangeRate } from 'src/entities/historic-exchange-rate.entity';
import { Saving } from 'src/entities/saving.entity';
import { SavingsBucket, SavingsBucketWithCurrent, SavingsBucketWithSavings } from 'src/entities/savings-bucket.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { convert } from 'src/utils/currency.utils';
import { Repository } from 'typeorm';

@Injectable()
export class SavingsBucketsService {
  constructor(
    @InjectRepository(SavingsBucket)
    private readonly savingsBucketRepository: Repository<SavingsBucket>,
    @InjectRepository(HistoricExchangeRate)
    private readonly historicExchangeRateRepository: Repository<HistoricExchangeRate>
  ) {}

  async getSavingsBuckets(user: LoggedUser): Promise<SavingsBucketWithCurrent[]> {
    const getDeleted = user.settings.showDeletedOptions ? '' : ' AND bucket.isDeleted = false';
    const displayCurrency = user.settings.displayCurrency;
    const entities = await this.savingsBucketRepository
      .createQueryBuilder('bucket')
      .leftJoinAndSelect('bucket.currency', 'currency')
      .leftJoinAndMapMany('bucket.savings', Saving, 'saving', 'saving.bucket = bucket.uuid')
      .leftJoinAndSelect('saving.currency', 'savingCurrency')
      .select('bucket')
      .addSelect('currency', 'currency')
      .addSelect('saving', 'savings')
      .addSelect('savingCurrency')
      .where('bucket.user = :user' + getDeleted, { user: user.uuid })
      .getMany();
    for (const entity of entities) {
      const bucketSavings = (<SavingsBucketWithSavings>entity).savings;
      let sumSavings = 0;
      for (const saving of bucketSavings) {
        const searchDate = DateTime.fromJSDate(saving.date).startOf('day');
        const historicExchangeRates = await this.historicExchangeRateRepository.findOne({
          where: { date: searchDate.toJSDate() },
        });
        if (!historicExchangeRates || !historicExchangeRates.rates[displayCurrency]) continue;
        sumSavings += convert(
          saving.amount,
          historicExchangeRates.rates[saving.currency.code],
          historicExchangeRates.rates[displayCurrency]
        );
      }
      delete (<Partial<SavingsBucketWithSavings>>entity).savings;
      (<SavingsBucketWithCurrent>entity).currentAmount = sumSavings;
    }
    return entities as SavingsBucketWithCurrent[];
  }

  async getSavingsBucketByUuid(user: LoggedUser, bucketUuid: string): Promise<SavingsBucket> {
    const bucket = await this.savingsBucketRepository.findOne({
      where: { uuid: bucketUuid, user: { uuid: user.uuid } },
      relations: ['currency'],
    });
    if (!bucket) throw new Error('Savings Bucket not found');
    return bucket;
  }

  async createSavingsBucket(user: LoggedUser, savingsBucketDto: SavingsBucketDto): Promise<SavingsBucket> {
    const newBucket = this.savingsBucketRepository.create({
      user: { uuid: user.uuid },
      name: savingsBucketDto.name,
      icon: savingsBucketDto.icon,
      iconColor: savingsBucketDto.iconColor,
      targetAmount: savingsBucketDto.targetAmount,
      currency: { id: savingsBucketDto.currency },
      deadline: savingsBucketDto.deadline ? DateTime.fromISO(savingsBucketDto.deadline).toJSDate() : null,
    });
    return this.savingsBucketRepository.save(newBucket);
  }

  async updateSavingsBucket(
    user: LoggedUser,
    bucketUuid: string,
    savingsBucketDto: SavingsBucketDto
  ): Promise<SavingsBucket> {
    const bucket = await this.savingsBucketRepository.findOneBy({
      uuid: bucketUuid,
      user: { uuid: user.uuid },
    });
    if (!bucket) throw new Error('Savings Bucket not found');
    await this.savingsBucketRepository.update(bucketUuid, {
      name: savingsBucketDto.name,
      icon: savingsBucketDto.icon,
      iconColor: savingsBucketDto.iconColor,
      targetAmount: savingsBucketDto.targetAmount,
      currency: { id: savingsBucketDto.currency },
      deadline: savingsBucketDto.deadline ? DateTime.fromISO(savingsBucketDto.deadline).toJSDate() : null,
    });
    return (await this.savingsBucketRepository.findOneBy({ uuid: bucketUuid }))!;
  }

  async deleteSavingsBucket(user: LoggedUser, bucketUuid: string): Promise<void> {
    const bucket = await this.savingsBucketRepository.findOneBy({
      uuid: bucketUuid,
      user: { uuid: user.uuid },
    });
    if (!bucket) throw new Error('Savings Bucket not found');
    await this.savingsBucketRepository.update(bucketUuid, { isDeleted: true });
  }

  async restoreSavingsBucket(user: LoggedUser, bucketUuid: string): Promise<void> {
    const bucket = await this.savingsBucketRepository.findOneBy({
      uuid: bucketUuid,
      user: { uuid: user.uuid },
    });
    if (!bucket) throw new Error('Savings Bucket not found');
    await this.savingsBucketRepository.update(bucketUuid, { isDeleted: false });
  }
}

