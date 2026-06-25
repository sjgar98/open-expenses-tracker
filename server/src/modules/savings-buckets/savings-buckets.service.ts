import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { SavingsBucketDto } from 'src/dto/savings-buckets.dto';
import { Saving } from 'src/entities/saving.entity';
import { SavingsBucket, SavingsBucketWithCurrent } from 'src/entities/savings-bucket.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SavingsBucketsService {
  constructor(
    @InjectRepository(SavingsBucket)
    private readonly savingsBucketRepository: Repository<SavingsBucket>,
    @InjectRepository(Saving)
    private readonly savingRepository: Repository<Saving>
  ) {}

  async getSavingsBuckets(user: LoggedUser): Promise<SavingsBucketWithCurrent[]> {
    const getDeleted = user.settings.showDeletedOptions ? '' : ' AND bucket.isDeleted = false';
    return await this.savingsBucketRepository
      .createQueryBuilder('bucket')
      .leftJoinAndSelect('bucket.currency', 'currency')
      .leftJoin(Saving, 'saving', 'saving.bucket = bucket.uuid')
      .select('bucket')
      .addSelect('currency', 'currency')
      .addSelect('COALESCE(SUM(saving.amount), 0)', 'currentAmount')
      .where('bucket.user = :user' + getDeleted, { user: user.uuid })
      .groupBy('bucket.uuid')
      .getRawAndEntities()
      .then(({ entities, raw }) => {
        return entities.map((entity, index) => {
          const rawRow = raw[index];
          return { ...entity, currentAmount: parseFloat(rawRow.currentAmount) };
        });
      });
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

