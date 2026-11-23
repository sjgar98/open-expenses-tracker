import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCycleOverrideDto, CreditCyclesQueryDto, CreditRulesDto, PaymentMethodDto, } from 'src/dto/payment-methods.dto';
import { CreditCycle } from 'src/entities/credit-cycle.entity';
import { HolidayCalendar } from 'src/entities/holiday-calendar.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { HolidayCalendarNotFoundException } from 'src/exceptions/holiday-calendars.exceptions';
import { CreditCycleNotFoundException, NotCreditPaymentMethodException, PaymentMethodNotFoundException, StatementDueBeforeClosingException, } from 'src/exceptions/payment-methods.exceptions';
import { Cycle, normalizeClosingRule, normalizeDueRule } from 'src/utils/credit-cycle.engine';
import { firstBy } from 'thenby';
import { Repository } from 'typeorm';
import { CreditScheduleService } from './credit-schedule.service';

const PREVIEW_CYCLE_COUNT = 6;

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(HolidayCalendar)
    private readonly holidayCalendarRepository: Repository<HolidayCalendar>,
    @InjectRepository(CreditCycle)
    private readonly creditCycleRepository: Repository<CreditCycle>,
    private readonly creditScheduleService: CreditScheduleService
  ) {}

  async getUserPaymentMethods(user: LoggedUser): Promise<PaymentMethod[]> {
    const results = await this.paymentMethodRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
      relations: { account: true, holidayCalendar: true },
    });
    return results.sort(firstBy('sortWeight', 'desc').thenBy('name'));
  }

  async getUserPaymentMethodByUuid(user: LoggedUser, paymentMethodUuid: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: paymentMethodUuid, user: { uuid: user.uuid } },
      relations: { account: true, holidayCalendar: true },
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
      ...(await this.getCreditFields(user, paymentMethodDto)),
      isDeleted: false,
    });
    const saved = await this.paymentMethodRepository.save(newPaymentMethod);
    await this.creditScheduleService.recompute(saved.uuid);
    return this.getUserPaymentMethodByUuid(user, saved.uuid);
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
      ...(await this.getCreditFields(user, paymentMethodDto)),
    });
    await this.creditScheduleService.recompute(paymentMethodUuid);
    return this.getUserPaymentMethodByUuid(user, paymentMethodUuid);
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

  async getUserPaymentMethodCycles(
    user: LoggedUser,
    paymentMethodUuid: string,
    query: CreditCyclesQueryDto
  ): Promise<Cycle[]> {
    const paymentMethod = await this.getUserPaymentMethodByUuid(user, paymentMethodUuid);
    if (!query.from || !query.to) return (await this.creditScheduleService.getScheduleWindow(paymentMethod)).cycles;
    return this.creditScheduleService.getCycles(paymentMethod, query.from, query.to);
  }

  async previewCycles(user: LoggedUser, rulesDto: CreditRulesDto): Promise<Cycle[]> {
    const holidayCalendar = await this.getUserHolidayCalendar(user, rulesDto.holidayCalendar);
    return this.creditScheduleService.previewCycles(
      {
        closingRule: normalizeClosingRule(rulesDto.creditClosingDateRule)!,
        dueRule: normalizeDueRule(rulesDto.creditDueDateRule)!,
        holidayCalendarUuid: holidayCalendar?.uuid ?? null,
      },
      PREVIEW_CYCLE_COUNT
    );
  }

  async createUserCreditCycleOverride(
    user: LoggedUser,
    paymentMethodUuid: string,
    overrideDto: CreditCycleOverrideDto
  ): Promise<void> {
    const paymentMethod = await this.getUserPaymentMethodByUuid(user, paymentMethodUuid);
    if (!paymentMethod.credit) throw new NotCreditPaymentMethodException();
    if (overrideDto.dueDate && overrideDto.dueDate < overrideDto.closingDate) {
      throw new StatementDueBeforeClosingException();
    }
    await this.creditCycleRepository.save(
      this.creditCycleRepository.create({
        paymentMethod: { uuid: paymentMethodUuid },
        closingDate: overrideDto.closingDate,
        dueDate: overrideDto.dueDate || null,
      })
    );
    await this.creditScheduleService.recompute(paymentMethodUuid);
  }

  async deleteUserCreditCycleOverride(user: LoggedUser, paymentMethodUuid: string, cycleUuid: string): Promise<void> {
    await this.getUserPaymentMethodByUuid(user, paymentMethodUuid);
    const override = await this.creditCycleRepository.findOneBy({
      uuid: cycleUuid,
      paymentMethod: { uuid: paymentMethodUuid },
    });
    if (!override) throw new CreditCycleNotFoundException();
    await this.creditCycleRepository.delete(cycleUuid);
    await this.creditScheduleService.recompute(paymentMethodUuid);
  }

  private async getCreditFields(user: LoggedUser, paymentMethodDto: PaymentMethodDto) {
    if (!paymentMethodDto.credit) {
      return { creditClosingDateRule: null, creditDueDateRule: null, holidayCalendar: null };
    }
    const holidayCalendar = await this.getUserHolidayCalendar(user, paymentMethodDto.holidayCalendar);
    return {
      creditClosingDateRule: normalizeClosingRule(paymentMethodDto.creditClosingDateRule),
      creditDueDateRule: normalizeDueRule(paymentMethodDto.creditDueDateRule),
      holidayCalendar: holidayCalendar ? { uuid: holidayCalendar.uuid } : null,
    };
  }

  private async getUserHolidayCalendar(
    user: LoggedUser,
    holidayCalendarUuid: string | null | undefined
  ): Promise<HolidayCalendar | null> {
    if (!holidayCalendarUuid) return null;
    const holidayCalendar = await this.holidayCalendarRepository.findOneBy({
      uuid: holidayCalendarUuid,
      user: { uuid: user.uuid },
    });
    if (!holidayCalendar) throw new HolidayCalendarNotFoundException();
    return holidayCalendar;
  }
}
