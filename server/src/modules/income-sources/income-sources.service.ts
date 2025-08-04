import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeSourceDto } from 'src/dto/income-sources.dto';
import { IncomeSource } from 'src/entities/income-source.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IncomeSourcesService {
  constructor(
    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>
  ) {}

  async getIncomeSources(userUuid: string): Promise<IncomeSource[]> {
    return this.incomeSourceRepository.find({ where: { user: { uuid: userUuid }, isDeleted: false } });
  }

  async getIncomeSourceByUuid(userUuid: string, sourceUuid: string): Promise<IncomeSource> {
    const source = await this.incomeSourceRepository.findOne({
      where: { uuid: sourceUuid, user: { uuid: userUuid } },
    });
    if (!source) throw new Error('Income Source not found');
    return source;
  }

  async createIncomeSource(userUuid: string, incomeSourceDto: IncomeSourceDto): Promise<IncomeSource> {
    const newSource = this.incomeSourceRepository.create({
      user: { uuid: userUuid },
      name: incomeSourceDto.name,
      color: incomeSourceDto.color,
      isDeleted: false,
    });
    return this.incomeSourceRepository.save(newSource);
  }

  async updateIncomeSource(
    userUuid: string,
    sourceUuid: string,
    incomeSourceDto: IncomeSourceDto
  ): Promise<IncomeSource> {
    const source = await this.incomeSourceRepository.findOneBy({
      uuid: sourceUuid,
      user: { uuid: userUuid },
    });
    if (!source) throw new Error('Income Source not found');
    await this.incomeSourceRepository.update(sourceUuid, {
      name: incomeSourceDto.name,
      color: incomeSourceDto.color,
    });
    return (await this.incomeSourceRepository.findOneBy({ uuid: sourceUuid }))!;
  }

  async deleteIncomeSource(userUuid: string, sourceUuid: string): Promise<void> {
    const source = await this.incomeSourceRepository.findOneBy({
      uuid: sourceUuid,
      user: { uuid: userUuid },
    });
    if (!source) throw new Error('Income Source not found');
    await this.incomeSourceRepository.update(sourceUuid, { isDeleted: true });
  }
}

