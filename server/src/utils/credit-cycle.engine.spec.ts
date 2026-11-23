import { applyRoll, buildCycles, closingCandidates, closingForMonth, ClosingRule, dueFor, DueRule, normalizeClosingRule, normalizeDueRule, summarize, WeekdayFromAnchorClosingRule, } from './credit-cycle.engine';

const HOLIDAYS_2026_H2 = new Set([
  '2026-07-09',
  '2026-07-10',
  '2026-08-17',
  '2026-10-12',
  '2026-11-09',
  '2026-11-23',
  '2026-12-07',
  '2026-12-08',
  '2026-12-25',
]);
const NO_HOLIDAYS = new Set<string>();

const THURSDAY_ON_OR_AFTER_26: WeekdayFromAnchorClosingRule = {
  kind: 'weekdayFromAnchor',
  weekday: 4,
  anchorDay: 26,
  direction: 'onOrAfter',
  roll: 'none',
};
const NINE_BUSINESS_DAYS: DueRule = { kind: 'offset', amount: 9, unit: 'businessDays', roll: 'none' };

describe('credit cycle engine', () => {
  it('reproduces the known 2026 cycles', () => {
    const cycles = buildCycles({
      closingRule: THURSDAY_ON_OR_AFTER_26,
      dueRule: NINE_BUSINESS_DAYS,
      holidays: HOLIDAYS_2026_H2,
      overrides: [],
      from: '2026-07-03',
      to: '2026-11-30',
    });
    expect(cycles.map(({ closingDate, dueDate }) => [closingDate, dueDate])).toEqual([
      ['2026-07-30', '2026-08-12'],
      ['2026-08-27', '2026-09-09'],
      ['2026-10-01', '2026-10-15'],
      ['2026-10-29', '2026-11-12'],
      ['2026-11-26', '2026-12-11'],
    ]);
  });

  describe('closingForMonth', () => {
    it('clamps the anchor day to the end of the month', () => {
      expect(closingForMonth(2027, 2, { ...THURSDAY_ON_OR_AFTER_26, anchorDay: 31, direction: 'onOrBefore' })).toBe(
        '2027-02-25'
      );
    });

    it('supports onOrBefore and nearest', () => {
      expect(closingForMonth(2026, 9, { ...THURSDAY_ON_OR_AFTER_26, direction: 'onOrBefore' })).toBe('2026-09-24');
      expect(closingForMonth(2026, 9, { ...THURSDAY_ON_OR_AFTER_26, anchorDay: 29, direction: 'nearest' })).toBe(
        '2026-10-01'
      );
    });
  });

  describe('applyRoll', () => {
    it('moves non-business days according to the roll', () => {
      expect(applyRoll('2026-12-07', 'following', HOLIDAYS_2026_H2)).toBe('2026-12-09');
      expect(applyRoll('2026-12-07', 'preceding', HOLIDAYS_2026_H2)).toBe('2026-12-04');
      expect(applyRoll('2026-12-07', 'none', HOLIDAYS_2026_H2)).toBe('2026-12-07');
      expect(applyRoll('2026-12-09', 'following', HOLIDAYS_2026_H2)).toBe('2026-12-09');
    });
  });

  describe('dueFor', () => {
    it('adds calendar days and rolls', () => {
      const rule: DueRule = { kind: 'offset', amount: 10, unit: 'calendarDays', roll: 'following' };
      expect(dueFor('2026-11-26', rule, NO_HOLIDAYS)).toBe('2026-12-07');
      expect(dueFor('2026-11-26', rule, HOLIDAYS_2026_H2)).toBe('2026-12-09');
    });

    it('takes the first legacy RRULE occurrence after the closing', () => {
      const rule: DueRule = { kind: 'rrule', rrule: 'DTSTART:20260101T000000Z\nRRULE:FREQ=MONTHLY;BYMONTHDAY=10' };
      expect(dueFor('2026-11-26', rule, NO_HOLIDAYS)).toBe('2026-12-10');
      expect(dueFor('2026-12-10', rule, NO_HOLIDAYS)).toBe('2027-01-10');
    });
  });

  it('rolls RRULE closings and keeps them inside the range', () => {
    const rule: ClosingRule = {
      kind: 'rrule',
      rrule: 'DTSTART:20260101T000000Z\nRRULE:FREQ=MONTHLY;BYMONTHDAY=7',
      roll: 'following',
    };
    expect(closingCandidates(rule, HOLIDAYS_2026_H2, '2026-11-01', '2026-12-31')).toEqual(['2026-11-10', '2026-12-09']);
  });

  describe('overrides', () => {
    const base = {
      closingRule: THURSDAY_ON_OR_AFTER_26,
      dueRule: NINE_BUSINESS_DAYS,
      holidays: HOLIDAYS_2026_H2,
      from: '2026-10-15',
      to: '2026-12-31',
    };

    it('replaces the estimated closing of the same cycle', () => {
      const cycles = buildCycles({
        ...base,
        overrides: [{ uuid: 'o1', closingDate: '2026-11-19', dueDate: null }],
      });
      expect(cycles.map((cycle) => [cycle.closingDate, cycle.closingSource, cycle.dueSource])).toEqual([
        ['2026-10-29', 'estimated', 'estimated'],
        ['2026-11-19', 'manual', 'estimated'],
        ['2026-12-31', 'estimated', 'estimated'],
      ]);
      expect(cycles[1].dueDate).toBe('2026-12-03');
    });

    it('uses the override due date when set', () => {
      const [cycle] = buildCycles({
        ...base,
        from: '2026-11-01',
        to: '2026-11-30',
        overrides: [{ uuid: 'o1', closingDate: '2026-11-26', dueDate: '2026-12-14' }],
      });
      expect(cycle).toEqual({
        closingDate: '2026-11-26',
        dueDate: '2026-12-14',
        closingSource: 'manual',
        dueSource: 'manual',
        overrideUuid: 'o1',
      });
    });
  });

  it('summarizes the statement being paid', () => {
    const cycles = buildCycles({
      closingRule: THURSDAY_ON_OR_AFTER_26,
      dueRule: NINE_BUSINESS_DAYS,
      holidays: HOLIDAYS_2026_H2,
      overrides: [],
      from: '2026-07-01',
      to: '2027-01-31',
    });
    const summary = summarize(cycles, '2026-11-30');
    expect(summary).toMatchObject({
      lastClosing: '2026-11-26',
      nextClosing: '2026-12-31',
      lastDue: '2026-11-12',
      nextDue: '2026-12-11',
      previousClosing: '2026-10-29',
    });
    expect(summary.current?.closingDate).toBe('2026-11-26');
  });

  describe('normalization', () => {
    it('keeps only known fields of valid rules', () => {
      expect(normalizeClosingRule({ ...THURSDAY_ON_OR_AFTER_26, extra: true })).toEqual(THURSDAY_ON_OR_AFTER_26);
      expect(normalizeDueRule({ ...NINE_BUSINESS_DAYS, extra: true })).toEqual(NINE_BUSINESS_DAYS);
    });

    it('rejects invalid rules', () => {
      expect(normalizeClosingRule({ ...THURSDAY_ON_OR_AFTER_26, weekday: 8 })).toBeNull();
      expect(normalizeClosingRule({ kind: 'rrule', rrule: 'nonsense', roll: 'none' })).toBeNull();
      expect(normalizeDueRule({ ...NINE_BUSINESS_DAYS, amount: 0 })).toBeNull();
      expect(normalizeDueRule('RRULE:FREQ=MONTHLY')).toBeNull();
    });
  });
});
