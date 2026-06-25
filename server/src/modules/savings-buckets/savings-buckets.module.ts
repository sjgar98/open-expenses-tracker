import { Module } from '@nestjs/common';
import { SavingsBucketsController } from './savings-buckets.controller';
import { SavingsBucketsService } from './savings-buckets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsBucket } from 'src/entities/savings-bucket.entity';
import { Saving } from 'src/entities/saving.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsBucket, Saving])],
  controllers: [SavingsBucketsController],
  providers: [SavingsBucketsService],
})
export class SavingsBucketsModule {}

