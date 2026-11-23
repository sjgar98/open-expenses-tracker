import { DateTime } from 'luxon';
import { rrulestr } from 'rrule';

export const ROLLS = ['none', 'following', 'preceding'] as const;
export const ANCHOR_DIRECTIONS = ['onOrAfter', 'onOrBefore', 'nearest'] as const;
export const DAY_UNITS = ['calendarDays', 'businessDays'] as const;

export type Roll = (typeof ROLLS)[number];
export type AnchorDirection = (typeof ANCHOR_DIRECTIONS)[number];
export type DayUnit = (typeof DAY_UNITS)[number];

export interface RRuleClosingRule {
  kind: 'rrule';
  rrule: string;
  roll: Roll;
}

export interface WeekdayFromAnchorClosingRule {
  kind: 'weekdayFromAnchor';
  weekday: number;
  anchorDay: number;
  direction: AnchorDirection;
  roll: Roll;
}

export type ClosingRule = RRuleClosingRule | WeekdayFromAnchorClosingRule;

export interface RRuleDueRule {
  kind: 'rrule';
  rrule: string;
}

export interface OffsetDueRule {
  kind: 'offset';
  amount: number;
  unit: DayUnit;
  roll: Roll;
}

export type DueRule = RRuleDueRule | OffsetDueRule;

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

export function closingForMonth(year: number, month: number, rule: WeekdayFromAnchorClosingRule): string {
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

function rawClosings(rule: ClosingRule, from: string, to: string): string[] {
  if (rule.kind === 'rrule') {
    const rangeStart = toDay(from).minus({ days: RRULE_RANGE_PADDING_DAYS });
    const rangeEnd = toDay(to).plus({ days: RRULE_RANGE_PADDING_DAYS }).endOf('day');
    return parseRRule(rule.rrule, toIso(rangeStart))
      .between(rangeStart.toJSDate(), rangeEnd.toJSDate(), true)
      .map(rruleDateToIso);
  }
  const closings: string[] = [];
  const lastMonth = toDay(to).plus({ months: 1 }).startOf('month');
  for (
    let month = toDay(from).minus({ months: 1 }).startOf('month');
    month <= lastMonth;
    month = month.plus({ months: 1 })
  ) {
    closings.push(closingForMonth(month.year, month.month, rule));
  }
  return closings;
}

export function closingCandidates(
  rule: ClosingRule,
  holidays: ReadonlySet<string>,
  from: string,
  to: string
): string[] {
  const rolled = rawClosings(rule, from, to).map((closing) => applyRoll(closing, rule.roll, holidays));
  return [...new Set(rolled)].filter((closing) => closing >= from && closing <= to).sort();
}

function addBusinessDays(iso: string, amount: number, holidays: ReadonlySet<string>): string {
  let day = toDay(iso);
  let counted = 0;
  while (counted < amount) {
    day = day.plus({ days: 1 });
    if (isBusinessDay(toIso(day), holidays)) counted++;
  }
  return toIso(day);
}

export function dueFor(closing: string, rule: DueRule, holidays: ReadonlySet<string>): string | null {
  if (rule.kind === 'rrule') {
    const next = parseRRule(rule.rrule, closing).after(toDay(closing).endOf('day').toJSDate());
    return next ? rruleDateToIso(next) : null;
  }
  if (rule.unit === 'businessDays') return addBusinessDays(closing, rule.amount, holidays);
  return applyRoll(toIso(toDay(closing).plus({ days: rule.amount })), rule.roll, holidays);
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

  const estimated: Cycle[] = closingCandidates(closingRule, holidays, from, to)
    .filter((closing) => !isReplacedByOverride(closing))
    .map((closing) => ({
      closingDate: closing,
      dueDate: dueFor(closing, dueRule, holidays),
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

export function normalizeClosingRule(value: unknown): ClosingRule | null {
  if (!value || typeof value !== 'object') return null;
  const rule = value as Record<string, unknown>;
  if (!isOneOf(ROLLS, rule.roll)) return null;
  if (rule.kind === 'rrule') {
    return isParsableRRule(rule.rrule) ? { kind: 'rrule', rrule: rule.rrule, roll: rule.roll } : null;
  }
  if (
    rule.kind === 'weekdayFromAnchor' &&
    isIntInRange(rule.weekday, 1, 7) &&
    isIntInRange(rule.anchorDay, 1, 31) &&
    isOneOf(ANCHOR_DIRECTIONS, rule.direction)
  ) {
    return {
      kind: 'weekdayFromAnchor',
      weekday: rule.weekday,
      anchorDay: rule.anchorDay,
      direction: rule.direction,
      roll: rule.roll,
    };
  }
  return null;
}

export function normalizeDueRule(value: unknown): DueRule | null {
  if (!value || typeof value !== 'object') return null;
  const rule = value as Record<string, unknown>;
  if (rule.kind === 'rrule') {
    return isParsableRRule(rule.rrule) ? { kind: 'rrule', rrule: rule.rrule } : null;
  }
  if (
    rule.kind === 'offset' &&
    isIntInRange(rule.amount, 1, MAX_OFFSET_AMOUNT) &&
    isOneOf(DAY_UNITS, rule.unit) &&
    isOneOf(ROLLS, rule.roll)
  ) {
    return { kind: 'offset', amount: rule.amount, unit: rule.unit, roll: rule.roll };
  }
  return null;
}
