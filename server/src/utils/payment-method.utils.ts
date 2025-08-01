import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';

export function getCreditFields(paymentMethodDto: {
  credit: boolean;
  creditClosingDateRule?: string | null;
  creditDueDateRule?: string | null;
}) {
  if (paymentMethodDto.credit && paymentMethodDto.creditClosingDateRule && paymentMethodDto.creditDueDateRule) {
    const creditClosingDateRule = rrulestr(paymentMethodDto.creditClosingDateRule);
    const creditDueDateRule = rrulestr(paymentMethodDto.creditDueDateRule);
    const nextDueOccurrence: Date | null = creditDueDateRule.after(new Date(), true);
    const nextClosingOccurrence: Date | null =
      nextDueOccurrence && creditClosingDateRule.after(nextDueOccurrence, true);

    let lastClosingOccurrence: Date | null = null;
    let lastDueOccurrence: Date | null = null;
    if (nextClosingOccurrence && nextDueOccurrence) {
      creditClosingDateRule.options.dtstart = DateTime.fromJSDate(nextClosingOccurrence).minus({ days: 40 }).toJSDate();
      creditDueDateRule.options.dtstart = DateTime.fromJSDate(nextDueOccurrence).minus({ days: 40 }).toJSDate();
      lastClosingOccurrence = creditClosingDateRule.before(nextClosingOccurrence);
      lastDueOccurrence = creditDueDateRule.before(nextDueOccurrence);
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

