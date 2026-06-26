import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethodDto } from 'src/dto/payment-methods.dto';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { PaymentMethodNotFoundException } from 'src/exceptions/payment-methods.exceptions';
import { getCreditFields } from 'src/utils/payment-method.utils';
import { firstBy } from 'thenby';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  async getUserPaymentMethods(user: LoggedUser): Promise<PaymentMethod[]> {
    const results = await this.paymentMethodRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
      relations: ['account'],
    });
    return results.sort(firstBy('sortWeight', 'desc').thenBy('name'));
  }

  async getUserPaymentMethodByUuid(user: LoggedUser, paymentMethodUuid: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: paymentMethodUuid, user: { uuid: user.uuid } },
      relations: ['account'],
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    return paymentMethod;
  }

  async createUserPaymentMethod(user: LoggedUser, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethod> {
    const newPaymentMethod = this.paymentMethodRepository.create({
      user: { uuid: user.uuid },
      sortWeight: paymentMethodDto.sortWeight,
      name: paymentMethodDto.name,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      account: { uuid: paymentMethodDto.account },
      credit: paymentMethodDto.credit,
      ...getCreditFields(paymentMethodDto),
      isDeleted: false,
    });
    return this.paymentMethodRepository.save(newPaymentMethod);
  }

  async updateUserPaymentMethod(
    user: LoggedUser,
    paymentMethodUuid: string,
    paymentMethodDto: PaymentMethodDto
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      uuid: paymentMethodUuid,
      user: { uuid: user.uuid },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    await this.paymentMethodRepository.update(paymentMethodUuid, {
      name: paymentMethodDto.name,
      sortWeight: paymentMethodDto.sortWeight,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      account: { uuid: paymentMethodDto.account },
      credit: paymentMethodDto.credit,
      ...getCreditFields(paymentMethodDto),
    });
    return (await this.paymentMethodRepository.findOneBy({ uuid: paymentMethodUuid }))!;
  }

  async deleteUserPaymentMethod(user: LoggedUser, paymentMethodUuid: string): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      uuid: paymentMethodUuid,
      user: { uuid: user.uuid },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    await this.paymentMethodRepository.update(paymentMethodUuid, { isDeleted: true });
  }

  async restoreUserPaymentMethod(user: LoggedUser, paymentMethodUuid: string): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      uuid: paymentMethodUuid,
      user: { uuid: user.uuid },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    await this.paymentMethodRepository.update(paymentMethodUuid, { isDeleted: false });
  }
}

