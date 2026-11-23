import type {
  ClosingRule,
  ClosingRuleDraft,
  CreditRulesDto,
  DueRule,
  DueRuleDraft,
  PaymentMethod,
  PaymentMethodDto,
  PaymentMethodForm,
} from '../model/payment-methods';

export const DEFAULT_CLOSING_RULE_DRAFT: ClosingRuleDraft = {
  kind: 'weekdayFromAnchor',
  rrule: '',
  weekday: '4',
  anchorDay: 26,
  direction: 'onOrAfter',
  roll: 'none',
};

export const DEFAULT_DUE_RULE_DRAFT: DueRuleDraft = {
  kind: 'offset',
  rrule: '',
  amount: 10,
  unit: 'calendarDays',
  roll: 'following',
};

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
  if (rule.kind === 'rrule') return { ...DEFAULT_CLOSING_RULE_DRAFT, kind: 'rrule', rrule: rule.rrule, roll: rule.roll };
  return { ...DEFAULT_CLOSING_RULE_DRAFT, ...rule, weekday: String(rule.weekday) };
}

export function toDueRuleDraft(rule: DueRule | null | undefined): DueRuleDraft {
  if (!rule) return DEFAULT_DUE_RULE_DRAFT;
  if (rule.kind === 'rrule') return { ...DEFAULT_DUE_RULE_DRAFT, kind: 'rrule', rrule: rule.rrule };
  return { ...DEFAULT_DUE_RULE_DRAFT, ...rule };
}

export function toClosingRule(draft: ClosingRuleDraft): ClosingRule {
  if (draft.kind === 'rrule') return { kind: 'rrule', rrule: draft.rrule.trim(), roll: draft.roll };
  return {
    kind: 'weekdayFromAnchor',
    weekday: Number(draft.weekday),
    anchorDay: Number(draft.anchorDay),
    direction: draft.direction,
    roll: draft.roll,
  };
}

export function toDueRule(draft: DueRuleDraft): DueRule {
  if (draft.kind === 'rrule') return { kind: 'rrule', rrule: draft.rrule.trim() };
  return { kind: 'offset', amount: Number(draft.amount), unit: draft.unit, roll: draft.roll };
}

export function toCreditRulesDto(form: PaymentMethodForm): CreditRulesDto {
  return {
    creditClosingDateRule: toClosingRule(form.creditClosingDateRule),
    creditDueDateRule: toDueRule(form.creditDueDateRule),
    holidayCalendar: form.holidayCalendar || null,
  };
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
