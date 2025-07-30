import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
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
    return this.paymentMethodRepository.find({ where: { user: { uuid: userUuid }, isDeleted: false } });
  }

  async getUserPaymentMethodByUuid(userUuid: string, paymentMethodUuid: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: paymentMethodUuid, user: { uuid: userUuid } },
    });
    if (!paymentMethod) throw new PaymentMethodNotFoundException();
    return paymentMethod;
  }

  async createUserPaymentMethod(userUuid: string, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethod> {
    const newPaymentMethod = this.paymentMethodRepository.create({
      user: { uuid: userUuid },
      name: paymentMethodDto.name,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      credit: paymentMethodDto.credit,
      ...this.getCreditFields(paymentMethodDto),
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
    await this.paymentMethodRepository.update(paymentMethodUuid, {
      name: paymentMethodDto.name,
      icon: paymentMethodDto.icon,
      iconColor: paymentMethodDto.iconColor,
      credit: paymentMethodDto.credit,
      ...this.getCreditFields(paymentMethodDto),
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

  private getCreditFields(paymentMethodDto: PaymentMethodDto) {
    if (paymentMethodDto.credit && paymentMethodDto.creditClosingDateRule && paymentMethodDto.creditDueDateRule) {
      const creditClosingDateRule = rrulestr(paymentMethodDto.creditClosingDateRule);
      const creditDueDateRule = rrulestr(paymentMethodDto.creditDueDateRule);
      const nextClosingOccurrence: Date | null = creditClosingDateRule.after(new Date(), true);
      const nextDueOccurrence: Date | null =
        nextClosingOccurrence && creditDueDateRule.after(nextClosingOccurrence, true);
      let lastClosingOccurrence: Date | null = null;
      let lastDueOccurrence: Date | null = null;
      if (nextClosingOccurrence) {
        creditClosingDateRule.options.dtstart = DateTime.fromJSDate(nextClosingOccurrence)
          .minus({ days: 40 })
          .toJSDate();
        lastClosingOccurrence = creditClosingDateRule.before(new Date(), true);
        lastDueOccurrence = lastClosingOccurrence && creditDueDateRule.after(lastClosingOccurrence, true);
      }
      return {
        creditClosingDateRule: paymentMethodDto.creditClosingDateRule,
        creditDueDateRule: paymentMethodDto.creditDueDateRule,
        nextClosingOccurrence,
        nextDueOccurrence,
        lastClosingOccurrence,
        lastDueOccurrence,
      };
    } else {
      return {
        creditClosingDateRule: null,
        creditDueDateRule: null,
        nextClosingOccurrence: null,
        nextDueOccurrence: null,
        lastClosingOccurrence: null,
        lastDueOccurrence: null,
      };
    }
  }
}

