import { Module } from '@nestjs/common';
import { IncomeSourcesController } from './income-sources.controller';
import { IncomeSourcesService } from './income-sources.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeSource } from 'src/entities/income-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeSource])],
  controllers: [IncomeSourcesController],
  providers: [IncomeSourcesService],
})
export class IncomeSourcesModule {}

