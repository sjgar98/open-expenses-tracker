import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rrulestr } from 'rrule';
import { PaymentMethodDto } from 'src/dto/payment-methods.dto';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { PaymentMethodNotFoundException } from 'src/exceptions/payment-methods.exceptions';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  async getUserPaymentMethods(userUuid: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({ where: { user: { uuid: userUuid } } });
  }

  async getUserPaymentMethodByUuid(userUuid: string, paymentMethodUuid: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: paymentMethodUuid, user: { uuid: userUuid } },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    return paymentMethod;
  }

  async createUserPaymentMethod(userUuid: string, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethod> {
    const nextClosingOccurrence =
      paymentMethodDto.credit && paymentMethodDto.creditClosingDateRule
        ? rrulestr(paymentMethodDto.creditClosingDateRule).after(new Date(), true)
        : null;
    const nextDueOccurrence =
      paymentMethodDto.credit && paymentMethodDto.creditDueDateRule
        ? rrulestr(paymentMethodDto.creditDueDateRule).after(new Date(), true)
        : null;
    const newPaymentMethod = this.paymentMethodRepository.create({
      user: { uuid: userUuid },
      name: paymentMethodDto.name,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      credit: paymentMethodDto.credit,
      creditClosingDateRule: paymentMethodDto.creditClosingDateRule,
      creditDueDateRule: paymentMethodDto.creditDueDateRule,
      nextClosingOccurrence,
      nextDueOccurrence,
      isDeleted: false,
    });
    return this.paymentMethodRepository.save(newPaymentMethod);
  }

  async updateUserPaymentMethod(
    userUuid: string,
    paymentMethodUuid: string,
    paymentMethodDto: PaymentMethodDto
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      uuid: paymentMethodUuid,
      user: { uuid: userUuid },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    const nextClosingOccurrence =
      paymentMethodDto.credit && paymentMethodDto.creditClosingDateRule
        ? rrulestr(paymentMethodDto.creditClosingDateRule).after(new Date(), true)
        : null;
    const nextDueOccurrence =
      paymentMethodDto.credit && paymentMethodDto.creditDueDateRule
        ? rrulestr(paymentMethodDto.creditDueDateRule).after(new Date(), true)
        : null;
    await this.paymentMethodRepository.update(paymentMethodUuid, {
      name: paymentMethodDto.name,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      credit: paymentMethodDto.credit,
      creditClosingDateRule: paymentMethodDto.creditClosingDateRule,
      creditDueDateRule: paymentMethodDto.creditDueDateRule,
      nextClosingOccurrence,
      nextDueOccurrence,
    });
    return (await this.paymentMethodRepository.findOneBy({ uuid: paymentMethodUuid }))!;
  }

  async deleteUserPaymentMethod(userUuid: string, paymentMethodUuid: string): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({
      uuid: paymentMethodUuid,
      user: { uuid: userUuid },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    await this.paymentMethodRepository.update(paymentMethodUuid, { isDeleted: true });
  }
}

