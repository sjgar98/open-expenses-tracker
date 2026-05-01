import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaxDto } from 'src/dto/tax.dto';
import { Tax } from 'src/entities/tax.entity';
import { User } from 'src/entities/user.entity';
import { TaxNotFoundException } from 'src/exceptions/taxes.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>
  ) {}

  async getUserTaxes(user: Omit<User, 'passwordHash'>): Promise<Tax[]> {
    return this.taxRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
    });
  }

  async getUserTaxByUuid(userUuid: string, taxUuid: string): Promise<Tax> {
    const tax = await this.taxRepository.findOne({
      where: { uuid: taxUuid, user: { uuid: userUuid } },
    });
    if (!tax) throw new TaxNotFoundException();
    return tax;
  }

  async createUserTax(userUuid: string, taxDto: TaxDto): Promise<Tax> {
    const newTax = this.taxRepository.create({
      user: { uuid: userUuid },
      name: taxDto.name,
      rate: taxDto.rate,
      isDeleted: false,
    });
    return this.taxRepository.save(newTax);
  }

  async updateUserTax(userUuid: string, taxUuid: string, taxDto: TaxDto): Promise<Tax> {
    const tax = await this.taxRepository.findOneBy({
      uuid: taxUuid,
      user: { uuid: userUuid },
    });
    if (!tax) throw new TaxNotFoundException();
    await this.taxRepository.update(taxUuid, {
      name: taxDto.name,
      rate: taxDto.rate,
    });
    return (await this.taxRepository.findOneBy({ uuid: taxUuid }))!;
  }

  async deleteUserTax(userUuid: string, taxUuid: string): Promise<void> {
    const tax = await this.taxRepository.findOneBy({
      uuid: taxUuid,
      user: { uuid: userUuid },
    });
    if (!tax) throw new TaxNotFoundException();
    await this.taxRepository.update(taxUuid, { isDeleted: true });
  }

  async restoreUserTax(userUuid: string, taxUuid: string): Promise<void> {
    const tax = await this.taxRepository.findOneBy({
      uuid: taxUuid,
      user: { uuid: userUuid },
    });
    if (!tax) throw new TaxNotFoundException();
    await this.taxRepository.update(taxUuid, { isDeleted: false });
  }
}

