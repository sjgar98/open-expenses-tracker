import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';

export const ROLLS = ['none', 'following', 'preceding'] as const;
export const ANCHOR_DIRECTIONS = ['onOrAfter', 'onOrBefore', 'nearest'] as const;
export const DAY_UNITS = ['calendarDays', 'businessDays'] as const;

export type Roll = (typeof ROLLS)[number];
export type AnchorDirection = (typeof ANCHOR_DIRECTIONS)[number];
export type DayUnit = (typeof DAY_UNITS)[number];

export interface RRuleRule {
  kind: 'rrule';
  rrule: string;
  roll: Roll;
}

export interface WeekdayFromAnchorRule {
  kind: 'weekdayFromAnchor';
  weekday: number;
  anchorDay: number;
  direction: AnchorDirection;
  roll: Roll;
}

export interface OffsetRule {
  kind: 'offset';
  amount: number;
  unit: DayUnit;
  roll: Roll;
}

export type ClosingRule = RRuleRule | WeekdayFromAnchorRule | OffsetRule;
export type DueRule = RRuleRule | WeekdayFromAnchorRule | OffsetRule;
type ScheduledRule = RRuleRule | WeekdayFromAnchorRule;

export type CycleSource = 'manual' | 'estimated';

export interface CycleOverride {
  uuid: string;
  closingDate: string;
  dueDate: string | null;
}

export interface Cycle {
  closingDate: string;
  dueDate: string | null;
  closingSource: CycleSource;
  dueSource: CycleSource;
  overrideUuid?: string;
}

export interface CycleSummary {
  lastClosing: string | null;
  nextClosing: string | null;
  lastDue: string | null;
  nextDue: string | null;
  current: Cycle | null;
  previousClosing: string | null;
}

export const MAX_OFFSET_AMOUNT = 120;
const OVERRIDE_MATCH_WINDOW_DAYS = 14;
const ROLL_SEARCH_LIMIT_DAYS = 366;
const RRULE_RANGE_PADDING_DAYS = 7;
const INDEPENDENT_DUE_SEARCH_DAYS = 62;
const OFFSET_CLOSING_PADDING_DAYS = 31;

function toDay(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: 'utc' });
}

function toIso(day: DateTime): string {
  return day.toISODate()!;
}

function daysBetween(a: string, b: string): number {
  return Math.abs(toDay(a).diff(toDay(b), 'days').days);
}

export function isBusinessDay(iso: string, holidays: ReadonlySet<string>): boolean {
  return toDay(iso).weekday <= 5 && !holidays.has(iso);
}

function shiftToBusinessDay(iso: string, step: 1 | -1, holidays: ReadonlySet<string>): string {
  let day = toDay(iso);
  for (let i = 0; i < ROLL_SEARCH_LIMIT_DAYS; i++) {
    if (isBusinessDay(toIso(day), holidays)) return toIso(day);
    day = day.plus({ days: step });
  }
  return iso;
}

export function applyRoll(iso: string, roll: Roll, holidays: ReadonlySet<string>): string {
  switch (roll) {
    case 'following':
      return shiftToBusinessDay(iso, 1, holidays);
    case 'preceding':
      return shiftToBusinessDay(iso, -1, holidays);
    case 'none':
      return iso;
  }
}

export function weekdayOfMonth(year: number, month: number, rule: WeekdayFromAnchorRule): string {
  const firstOfMonth = DateTime.utc(year, month, 1);
  const anchor = firstOfMonth.set({ day: Math.min(rule.anchorDay, firstOfMonth.daysInMonth!) });
  const daysForward = (rule.weekday - anchor.weekday + 7) % 7;
  const daysBackward = (anchor.weekday - rule.weekday + 7) % 7;
  switch (rule.direction) {
    case 'onOrAfter':
      return toIso(anchor.plus({ days: daysForward }));
    case 'onOrBefore':
      return toIso(anchor.minus({ days: daysBackward }));
    case 'nearest':
      return toIso(
        daysForward <= daysBackward ? anchor.plus({ days: daysForward }) : anchor.minus({ days: daysBackward })
      );
  }
}

function parseRRule(rrule: string, fallbackStart: string) {
  const hasStart = /DTSTART/i.test(rrule);
  return rrulestr(rrule, hasStart ? {} : { dtstart: toDay(fallbackStart).toJSDate() });
}

function rruleDateToIso(date: Date): string {
  return toIso(DateTime.fromJSDate(date, { zone: 'utc' }));
}

function rawOccurrences(rule: ScheduledRule, from: string, to: string): string[] {
  if (rule.kind === 'rrule') {
    const rangeStart = toDay(from).minus({ days: RRULE_RANGE_PADDING_DAYS });
    const rangeEnd = toDay(to).plus({ days: RRULE_RANGE_PADDING_DAYS }).endOf('day');
    return parseRRule(rule.rrule, toIso(rangeStart))
      .between(rangeStart.toJSDate(), rangeEnd.toJSDate(), true)
      .map(rruleDateToIso);
  }
  const occurrences: string[] = [];
  const lastMonth = toDay(to).plus({ months: 1 }).startOf('month');
  for (
    let month = toDay(from).minus({ months: 1 }).startOf('month');
    month <= lastMonth;
    month = month.plus({ months: 1 })
  ) {
    occurrences.push(weekdayOfMonth(month.year, month.month, rule));
  }
  return occurrences;
}

export function scheduledDates(rule: ScheduledRule, holidays: ReadonlySet<string>, from: string, to: string): string[] {
  const rolled = rawOccurrences(rule, from, to).map((date) => applyRoll(date, rule.roll, holidays));
  return [...new Set(rolled)].filter((date) => date >= from && date <= to).sort();
}

function shiftBusinessDays(iso: string, amount: number, step: 1 | -1, holidays: ReadonlySet<string>): string {
  let day = toDay(iso);
  let counted = 0;
  while (counted < amount) {
    day = day.plus({ days: step });
    if (isBusinessDay(toIso(day), holidays)) counted++;
  }
  return toIso(day);
}

export function applyOffset(iso: string, rule: OffsetRule, step: 1 | -1, holidays: ReadonlySet<string>): string {
  if (rule.unit === 'businessDays') return shiftBusinessDays(iso, rule.amount, step, holidays);
  return applyRoll(toIso(toDay(iso).plus({ days: rule.amount * step })), rule.roll, holidays);
}

export function dueFor(closing: string, rule: DueRule, holidays: ReadonlySet<string>): string | null {
  if (rule.kind === 'offset') return applyOffset(closing, rule, 1, holidays);
  if (rule.kind === 'rrule') {
    const next = parseRRule(rule.rrule, closing).after(toDay(closing).endOf('day').toJSDate());
    return next ? applyRoll(rruleDateToIso(next), rule.roll, holidays) : null;
  }
  const searchStart = toIso(toDay(closing).plus({ days: 1 }));
  const searchEnd = toIso(toDay(closing).plus({ days: INDEPENDENT_DUE_SEARCH_DAYS }));
  return scheduledDates(rule, holidays, searchStart, searchEnd)[0] ?? null;
}

export function isResolvableRulePair(closingRule: Pick<ClosingRule, 'kind'>, dueRule: Pick<DueRule, 'kind'>): boolean {
  return !(closingRule.kind === 'offset' && dueRule.kind === 'offset');
}

interface EstimatedPair {
  closing: string;
  due: string | null;
}

function estimatedPairs(
  closingRule: ClosingRule,
  dueRule: DueRule,
  holidays: ReadonlySet<string>,
  from: string,
  to: string
): EstimatedPair[] {
  if (closingRule.kind !== 'offset') {
    return scheduledDates(closingRule, holidays, from, to).map((closing) => ({
      closing,
      due: dueFor(closing, dueRule, holidays),
    }));
  }
  if (dueRule.kind === 'offset') return [];
  const duesEnd = toIso(toDay(to).plus({ days: closingRule.amount * 2 + OFFSET_CLOSING_PADDING_DAYS }));
  return scheduledDates(dueRule, holidays, from, duesEnd)
    .map((due) => ({ closing: applyOffset(due, closingRule, -1, holidays), due }))
    .filter(({ closing }) => closing >= from && closing <= to);
}

export interface BuildCyclesInput {
  closingRule: ClosingRule;
  dueRule: DueRule;
  holidays: ReadonlySet<string>;
  overrides: CycleOverride[];
  from: string;
  to: string;
}

export function buildCycles({ closingRule, dueRule, holidays, overrides, from, to }: BuildCyclesInput): Cycle[] {
  const isReplacedByOverride = (closing: string) =>
    overrides.some((override) => daysBetween(closing, override.closingDate) <= OVERRIDE_MATCH_WINDOW_DAYS);

  if (!isResolvableRulePair(closingRule, dueRule)) return [];

  const estimated: Cycle[] = estimatedPairs(closingRule, dueRule, holidays, from, to)
    .filter(({ closing }) => !isReplacedByOverride(closing))
    .map(({ closing, due }) => ({
      closingDate: closing,
      dueDate: due,
      closingSource: 'estimated',
      dueSource: 'estimated',
    }));

  const manual: Cycle[] = overrides
    .filter((override) => override.closingDate >= from && override.closingDate <= to)
    .map((override) => ({
      closingDate: override.closingDate,
      dueDate: override.dueDate ?? dueFor(override.closingDate, dueRule, holidays),
      closingSource: 'manual',
      dueSource: override.dueDate ? 'manual' : 'estimated',
      overrideUuid: override.uuid,
    }));

  return [...estimated, ...manual].sort((a, b) => a.closingDate.localeCompare(b.closingDate));
}

export function summarize(cycles: Cycle[], today: string): CycleSummary {
  const closings = cycles.map((cycle) => cycle.closingDate);
  const dues = cycles
    .map((cycle) => cycle.dueDate)
    .filter((due): due is string => due !== null)
    .sort();
  const currentIndex = cycles.findIndex((cycle) => cycle.dueDate !== null && cycle.dueDate >= today);
  return {
    lastClosing: closings.filter((closing) => closing <= today).at(-1) ?? null,
    nextClosing: closings.find((closing) => closing > today) ?? null,
    lastDue: dues.filter((due) => due < today).at(-1) ?? null,
    nextDue: dues.find((due) => due >= today) ?? null,
    current: currentIndex >= 0 ? cycles[currentIndex] : null,
    previousClosing: currentIndex > 0 ? cycles[currentIndex - 1].closingDate : null,
  };
}

function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (values as readonly string[]).includes(value);
}

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function isParsableRRule(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    rrulestr(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeRRule(rule: Record<string, unknown>): RRuleRule | null {
  return isParsableRRule(rule.rrule) && isOneOf(ROLLS, rule.roll)
    ? { kind: 'rrule', rrule: rule.rrule, roll: rule.roll }
    : null;
}

function normalizeWeekdayFromAnchor(rule: Record<string, unknown>): WeekdayFromAnchorRule | null {
  if (
    !isIntInRange(rule.weekday, 1, 7) ||
    !isIntInRange(rule.anchorDay, 1, 31) ||
    !isOneOf(ANCHOR_DIRECTIONS, rule.direction) ||
    !isOneOf(ROLLS, rule.roll)
  ) {
    return null;
  }
  return {
    kind: 'weekdayFromAnchor',
    weekday: rule.weekday,
    anchorDay: rule.anchorDay,
    direction: rule.direction,
    roll: rule.roll,
  };
}

function normalizeOffset(rule: Record<string, unknown>): OffsetRule | null {
  if (
    !isIntInRange(rule.amount, 1, MAX_OFFSET_AMOUNT) ||
    !isOneOf(DAY_UNITS, rule.unit) ||
    !isOneOf(ROLLS, rule.roll)
  ) {
    return null;
  }
  return { kind: 'offset', amount: rule.amount, unit: rule.unit, roll: rule.roll };
}

export function normalizeClosingRule(value: unknown): ClosingRule | null {
  if (!value || typeof value !== 'object') return null;
  const rule = value as Record<string, unknown>;
  switch (rule.kind) {
    case 'rrule':
      return normalizeRRule(rule);
    case 'weekdayFromAnchor':
      return normalizeWeekdayFromAnchor(rule);
    case 'offset':
      return normalizeOffset(rule);
    default:
      return null;
  }
}

export function normalizeDueRule(value: unknown): DueRule | null {
  if (!value || typeof value !== 'object') return null;
  const rule = value as Record<string, unknown>;
  switch (rule.kind) {
    case 'rrule':
      return normalizeRRule(rule);
    case 'weekdayFromAnchor':
      return normalizeWeekdayFromAnchor(rule);
    case 'offset':
      return normalizeOffset(rule);
    default:
      return null;
  }
}
