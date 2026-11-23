import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { CreditCycle } from 'src/entities/credit-cycle.entity';
import { HolidayDate } from 'src/entities/holiday-date.entity';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { buildCycles, ClosingRule, Cycle, CycleOverride, CycleSummary, DueRule, summarize, } from 'src/utils/credit-cycle.engine';
import { Repository } from 'typeorm';

export interface CreditRules {
  closingRule: ClosingRule;
  dueRule: DueRule;
  holidayCalendarUuid: string | null;
}

const SCHEDULE_WINDOW_DAYS = 120;
const PREVIEW_WINDOW_DAYS = 400;

function isoDate(day: DateTime): string {
  return day.toISODate()!;
}

export function today(): string {
  return isoDate(DateTime.now());
}

export function isoDateToLocalDate(iso: string | null): Date | null {
  return iso ? DateTime.fromISO(iso).toJSDate() : null;
}

@Injectable()
export class CreditScheduleService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(HolidayDate)
    private readonly holidayDateRepository: Repository<HolidayDate>,
    @InjectRepository(CreditCycle)
    private readonly creditCycleRepository: Repository<CreditCycle>
  ) {}

  rulesOf(paymentMethod: PaymentMethod): CreditRules | null {
    if (!paymentMethod.credit || !paymentMethod.creditClosingDateRule || !paymentMethod.creditDueDateRule) return null;
    return {
      closingRule: paymentMethod.creditClosingDateRule,
      dueRule: paymentMethod.creditDueDateRule,
      holidayCalendarUuid: paymentMethod.holidayCalendar?.uuid ?? null,
    };
  }

  async getCycles(paymentMethod: PaymentMethod, from: string, to: string): Promise<Cycle[]> {
    const rules = this.rulesOf(paymentMethod);
    if (!rules) return [];
    return buildCycles({
      closingRule: rules.closingRule,
      dueRule: rules.dueRule,
      holidays: await this.getHolidays(rules.holidayCalendarUuid),
      overrides: await this.getOverrides(paymentMethod.uuid),
      from,
      to,
    });
  }

  async getScheduleWindow(paymentMethod: PaymentMethod): Promise<{ cycles: Cycle[]; summary: CycleSummary }> {
    const now = DateTime.now();
    const cycles = await this.getCycles(
      paymentMethod,
      isoDate(now.minus({ days: SCHEDULE_WINDOW_DAYS })),
      isoDate(now.plus({ days: SCHEDULE_WINDOW_DAYS }))
    );
    return { cycles, summary: summarize(cycles, today()) };
  }

  async previewCycles(rules: CreditRules, count: number): Promise<Cycle[]> {
    const start = today();
    const cycles = buildCycles({
      closingRule: rules.closingRule,
      dueRule: rules.dueRule,
      holidays: await this.getHolidays(rules.holidayCalendarUuid),
      overrides: [],
      from: start,
      to: isoDate(DateTime.now().plus({ days: PREVIEW_WINDOW_DAYS })),
    });
    return cycles.slice(0, count);
  }

  async recompute(paymentMethodUuid: string): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { uuid: paymentMethodUuid },
      relations: { holidayCalendar: true },
    });
    if (!paymentMethod) return;
    const { summary } = await this.getScheduleWindow(paymentMethod);
    await this.paymentMethodRepository.update(paymentMethodUuid, {
      lastClosingOccurrence: isoDateToLocalDate(summary.lastClosing),
      nextClosingOccurrence: isoDateToLocalDate(summary.nextClosing),
      lastDueOccurrence: isoDateToLocalDate(summary.lastDue),
      nextDueOccurrence: isoDateToLocalDate(summary.nextDue),
    });
  }

  async recomputeForCalendar(holidayCalendarUuid: string): Promise<void> {
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { credit: true, holidayCalendar: { uuid: holidayCalendarUuid } },
      select: { uuid: true },
    });
    for (const paymentMethod of paymentMethods) {
      await this.recompute(paymentMethod.uuid);
    }
  }

  private async getHolidays(holidayCalendarUuid: string | null): Promise<Set<string>> {
    if (!holidayCalendarUuid) return new Set();
    const dates = await this.holidayDateRepository.find({
      where: { calendar: { uuid: holidayCalendarUuid } },
      select: { date: true },
    });
    return new Set(dates.map((holidayDate) => holidayDate.date));
  }

  private async getOverrides(paymentMethodUuid: string): Promise<CycleOverride[]> {
    const overrides = await this.creditCycleRepository.find({
      where: { paymentMethod: { uuid: paymentMethodUuid } },
    });
    return overrides.map(({ uuid, closingDate, dueDate }) => ({ uuid, closingDate, dueDate }));
  }
}
