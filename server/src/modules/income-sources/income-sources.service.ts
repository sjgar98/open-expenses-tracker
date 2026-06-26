import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeSourceDto } from 'src/dto/income-sources.dto';
import { IncomeSource } from 'src/entities/income-source.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IncomeSourcesService {
  constructor(
    @InjectRepository(IncomeSource)
    private readonly incomeSourceRepository: Repository<IncomeSource>
  ) {}

  async getIncomeSources(user: LoggedUser): Promise<IncomeSource[]> {
    return this.incomeSourceRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
    });
  }

  async getIncomeSourceByUuid(user: LoggedUser, sourceUuid: string): Promise<IncomeSource> {
    const source = await this.incomeSourceRepository.findOne({
      where: { uuid: sourceUuid, user: { uuid: user.uuid } },
    });
    if (!source) throw new Error('Income Source not found');
    return source;
  }

  async createIncomeSource(user: LoggedUser, incomeSourceDto: IncomeSourceDto): Promise<IncomeSource> {
    const newSource = this.incomeSourceRepository.create({
      user: { uuid: user.uuid },
      name: incomeSourceDto.name,
      color: incomeSourceDto.color,
      isDeleted: false,
    });
    return this.incomeSourceRepository.save(newSource);
  }

  async updateIncomeSource(
    user: LoggedUser,
    sourceUuid: string,
    incomeSourceDto: IncomeSourceDto
  ): Promise<IncomeSource> {
    const source = await this.incomeSourceRepository.findOneBy({
      uuid: sourceUuid,
      user: { uuid: user.uuid },
    });
    if (!source) throw new Error('Income Source not found');
    await this.incomeSourceRepository.update(sourceUuid, {
      name: incomeSourceDto.name,
      color: incomeSourceDto.color,
    });
    return (await this.incomeSourceRepository.findOneBy({ uuid: sourceUuid }))!;
  }

  async deleteIncomeSource(user: LoggedUser, sourceUuid: string): Promise<void> {
    const source = await this.incomeSourceRepository.findOneBy({
      uuid: sourceUuid,
      user: { uuid: user.uuid },
    });
    if (!source) throw new Error('Income Source not found');
    await this.incomeSourceRepository.update(sourceUuid, { isDeleted: true });
  }

  async restoreUserIncomeSource(user: LoggedUser, sourceUuid: string): Promise<void> {
    const source = await this.incomeSourceRepository.findOneBy({
      uuid: sourceUuid,
      user: { uuid: user.uuid },
    });
    if (!source) throw new Error('Income Source not found');
    await this.incomeSourceRepository.update(sourceUuid, { isDeleted: false });
  }
}

