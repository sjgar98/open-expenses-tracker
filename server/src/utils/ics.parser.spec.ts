import { DateTime } from 'luxon';
import { InvalidIcsError, parseIcsHolidays } from './ics.parser';

const TODAY = DateTime.utc(2026, 11, 23);

function calendar(...events: string[]): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...events, 'END:VCALENDAR'].join('\r\n');
}

describe('parseIcsHolidays', () => {
  it('reads all-day and multi-day events', () => {
    const ics = calendar(
      'BEGIN:VEVENT',
      'UID:a',
      'DTSTART;VALUE=DATE:20261208',
      'DTEND;VALUE=DATE:20261209',
      'SUMMARY:Single day',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:b',
      'DTSTART;VALUE=DATE:20261224',
      'DTEND;VALUE=DATE:20261227',
      'SUMMARY:Three',
      '  days',
      'END:VEVENT'
    );
    expect(parseIcsHolidays(ics, TODAY)).toEqual([
      { date: '2026-12-08', label: 'Single day' },
      { date: '2026-12-24', label: 'Three days' },
      { date: '2026-12-25', label: 'Three days' },
      { date: '2026-12-26', label: 'Three days' },
    ]);
  });

  it('reduces a timed event to its date', () => {
    const ics = calendar(
      'BEGIN:VEVENT',
      'UID:c',
      'DTSTART:20261201T100000Z',
      'DTEND:20261201T120000Z',
      'SUMMARY:Timed',
      'END:VEVENT'
    );
    expect(parseIcsHolidays(ics, TODAY)).toEqual([{ date: '2026-12-01', label: 'Timed' }]);
  });

  it('expands yearly rules with exclusions and moved occurrences', () => {
    const ics = calendar(
      'BEGIN:VEVENT',
      'UID:yearly',
      'DTSTART;VALUE=DATE:20250520',
      'RRULE:FREQ=YEARLY;COUNT=4',
      'EXDATE;VALUE=DATE:20260520',
      'SUMMARY:Yearly',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:yearly',
      'RECURRENCE-ID;VALUE=DATE:20270520',
      'DTSTART;VALUE=DATE:20270524',
      'SUMMARY:Yearly (moved)',
      'END:VEVENT'
    );
    expect(parseIcsHolidays(ics, TODAY)).toEqual([
      { date: '2025-05-20', label: 'Yearly' },
      { date: '2027-05-24', label: 'Yearly (moved)' },
      { date: '2028-05-20', label: 'Yearly' },
    ]);
  });

  it('rejects input that is not a calendar', () => {
    expect(() => parseIcsHolidays('not a calendar', TODAY)).toThrow(InvalidIcsError);
    expect(() => parseIcsHolidays('BEGIN:VEVENT\r\nEND:VEVENT', TODAY)).toThrow(InvalidIcsError);
  });
});
