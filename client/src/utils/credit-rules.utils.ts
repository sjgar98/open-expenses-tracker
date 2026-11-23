import type { AnchorDirection, ClosingRule, ClosingRuleDraft, DayUnit, Roll, CreditRulesDto, DueRule, DueRuleDraft, OffsetRule, PaymentMethod, PaymentMethodDto, PaymentMethodForm, WeekdayFromAnchorRule, } from '../model/payment-methods';

type RuleDraft = ClosingRuleDraft | DueRuleDraft;

const EMPTY_RULE_DRAFT_FIELDS = {
  rrule: '',
  weekday: '',
  anchorDay: '',
  direction: '',
  amount: '',
  unit: '',
  roll: '',
} as const;

export const DEFAULT_CLOSING_RULE_DRAFT: ClosingRuleDraft = { kind: 'weekdayFromAnchor', ...EMPTY_RULE_DRAFT_FIELDS };

export const DEFAULT_DUE_RULE_DRAFT: DueRuleDraft = { kind: 'weekdayFromAnchor', ...EMPTY_RULE_DRAFT_FIELDS };

export const EMPTY_PAYMENT_METHOD_FORM: PaymentMethodForm = {
  name: '',
  sortWeight: 0,
  icon: '',
  iconColor: '#FFFFFF',
  account: '',
  credit: false,
  holidayCalendar: null,
  creditClosingDateRule: DEFAULT_CLOSING_RULE_DRAFT,
  creditDueDateRule: DEFAULT_DUE_RULE_DRAFT,
};

export function toClosingRuleDraft(rule: ClosingRule | null | undefined): ClosingRuleDraft {
  if (!rule) return DEFAULT_CLOSING_RULE_DRAFT;
  if (rule.kind === 'weekdayFromAnchor')
    return { ...DEFAULT_CLOSING_RULE_DRAFT, ...rule, weekday: String(rule.weekday) };
  return { ...DEFAULT_CLOSING_RULE_DRAFT, ...rule };
}

export function toDueRuleDraft(rule: DueRule | null | undefined): DueRuleDraft {
  if (!rule) return DEFAULT_DUE_RULE_DRAFT;
  if (rule.kind === 'weekdayFromAnchor') return { ...DEFAULT_DUE_RULE_DRAFT, ...rule, weekday: String(rule.weekday) };
  return { ...DEFAULT_DUE_RULE_DRAFT, ...rule };
}

type RuleSide = 'closing' | 'due';
type RuleDraftField = Exclude<keyof RuleDraft, 'kind'>;

export function usesRoll(draft: RuleDraft, side: RuleSide): boolean {
  if (draft.kind === 'offset') return draft.unit === 'calendarDays';
  if (draft.kind === 'rrule') return side === 'closing';
  return true;
}

function requiredFields(draft: RuleDraft, side: RuleSide): RuleDraftField[] {
  const fields: RuleDraftField[] =
    draft.kind === 'weekdayFromAnchor'
      ? ['weekday', 'direction', 'anchorDay']
      : draft.kind === 'offset'
        ? ['amount', 'unit']
        : ['rrule'];
  return usesRoll(draft, side) ? [...fields, 'roll'] : fields;
}

function missingFields(draft: RuleDraft, side: RuleSide): RuleDraftField[] {
  return requiredFields(draft, side).filter((field) => String(draft[field]).trim() === '');
}

export function validateCreditRules(form: PaymentMethodForm, requiredMessage: string): Record<string, string> {
  if (!form.credit) return {};
  const errors: Record<string, string> = {};
  for (const [path, draft, side] of [
    ['creditClosingDateRule', form.creditClosingDateRule, 'closing'],
    ['creditDueDateRule', form.creditDueDateRule, 'due'],
  ] as const) {
    for (const field of missingFields(draft, side)) errors[`${path}.${field}`] = requiredMessage;
  }
  return errors;
}

function toWeekdayFromAnchorRule(draft: RuleDraft): WeekdayFromAnchorRule {
  return {
    kind: 'weekdayFromAnchor',
    weekday: Number(draft.weekday),
    anchorDay: Number(draft.anchorDay),
    direction: draft.direction as AnchorDirection,
    roll: draft.roll as Roll,
  };
}

function toOffsetRule(draft: RuleDraft): OffsetRule {
  return {
    kind: 'offset',
    amount: Number(draft.amount),
    unit: draft.unit as DayUnit,
    roll: draft.unit === 'calendarDays' ? (draft.roll as Roll) : 'none',
  };
}

export function toClosingRule(draft: ClosingRuleDraft): ClosingRule | null {
  if (missingFields(draft, 'closing').length) return null;
  switch (draft.kind) {
    case 'rrule':
      return { kind: 'rrule', rrule: draft.rrule.trim(), roll: draft.roll as Roll };
    case 'weekdayFromAnchor':
      return toWeekdayFromAnchorRule(draft);
    case 'offset':
      return toOffsetRule(draft);
  }
}

export function toDueRule(draft: DueRuleDraft): DueRule | null {
  if (missingFields(draft, 'due').length) return null;
  switch (draft.kind) {
    case 'rrule':
      return { kind: 'rrule', rrule: draft.rrule.trim() };
    case 'weekdayFromAnchor':
      return toWeekdayFromAnchorRule(draft);
    case 'offset':
      return toOffsetRule(draft);
  }
}

export function toCreditRulesDto(form: PaymentMethodForm): CreditRulesDto | null {
  const creditClosingDateRule = toClosingRule(form.creditClosingDateRule);
  const creditDueDateRule = toDueRule(form.creditDueDateRule);
  if (!creditClosingDateRule || !creditDueDateRule) return null;
  return { creditClosingDateRule, creditDueDateRule, holidayCalendar: form.holidayCalendar || null };
}

export function toPaymentMethodDto(form: PaymentMethodForm): PaymentMethodDto {
  const base: PaymentMethodDto = {
    name: form.name,
    sortWeight: form.sortWeight,
    icon: form.icon,
    iconColor: form.iconColor,
    account: form.account,
    credit: form.credit,
  };
  return form.credit ? { ...base, ...toCreditRulesDto(form) } : base;
}

export function toPaymentMethodForm(paymentMethod: PaymentMethod): PaymentMethodForm {
  return {
    name: paymentMethod.name,
    sortWeight: paymentMethod.sortWeight,
    icon: paymentMethod.icon,
    iconColor: paymentMethod.iconColor,
    account: paymentMethod.account.uuid,
    credit: paymentMethod.credit,
    holidayCalendar: paymentMethod.holidayCalendar?.uuid ?? null,
    creditClosingDateRule: toClosingRuleDraft(paymentMethod.creditClosingDateRule),
    creditDueDateRule: toDueRuleDraft(paymentMethod.creditDueDateRule),
  };
}
