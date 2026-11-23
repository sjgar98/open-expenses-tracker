import type { Account } from './accounts';
import type { HolidayCalendar } from './holiday-calendars';

export type Roll = 'none' | 'following' | 'preceding';
export type AnchorDirection = 'onOrAfter' | 'onOrBefore' | 'nearest';
export type DayUnit = 'calendarDays' | 'businessDays';
export type CycleSource = 'manual' | 'estimated';

export type WeekdayFromAnchorRule = {
  kind: 'weekdayFromAnchor';
  weekday: number;
  anchorDay: number;
  direction: AnchorDirection;
  roll: Roll;
};
export type OffsetRule = { kind: 'offset'; amount: number; unit: DayUnit; roll: Roll };

export type ClosingRule = { kind: 'rrule'; rrule: string; roll: Roll } | WeekdayFromAnchorRule | OffsetRule;
export type DueRule = { kind: 'rrule'; rrule: string; roll: Roll } | WeekdayFromAnchorRule | OffsetRule;

interface RuleDraftFields {
  rrule: string;
  weekday: string;
  anchorDay: number | '';
  direction: AnchorDirection | '';
  amount: number | '';
  unit: DayUnit | '';
  roll: Roll | '';
}

export interface ClosingRuleDraft extends RuleDraftFields {
  kind: ClosingRule['kind'];
}

export interface DueRuleDraft extends RuleDraftFields {
  kind: DueRule['kind'];
}

export interface Cycle {
  closingDate: string;
  dueDate: string | null;
  closingSource: CycleSource;
  dueSource: CycleSource;
  overrideUuid?: string;
}

export interface PaymentMethod {
  uuid: string;
  name: string;
  sortWeight: number;
  icon: string;
  iconColor: string;
  account: Account;
  credit: boolean;
  creditClosingDateRule?: ClosingRule | null;
  creditDueDateRule?: DueRule | null;
  holidayCalendar?: Pick<HolidayCalendar, 'uuid' | 'name'> | null;
  nextClosingOccurrence: string | null;
  nextDueOccurrence: string | null;
  isDeleted: boolean;
}

export interface PaymentMethodDto {
  name: string;
  sortWeight: number;
  icon: string;
  iconColor: string;
  account: string;
  credit: boolean;
  creditClosingDateRule?: ClosingRule;
  creditDueDateRule?: DueRule;
  holidayCalendar?: string | null;
}

export interface PaymentMethodForm extends Omit<PaymentMethodDto, 'creditClosingDateRule' | 'creditDueDateRule'> {
  creditClosingDateRule: ClosingRuleDraft;
  creditDueDateRule: DueRuleDraft;
}

export interface CreditRulesDto {
  creditClosingDateRule: ClosingRule;
  creditDueDateRule: DueRule;
  holidayCalendar?: string | null;
}

export interface CreditCycleOverrideDto {
  closingDate: string;
  dueDate?: string | null;
}
