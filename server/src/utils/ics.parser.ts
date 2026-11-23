import { DateTime } from 'luxon';
import * as icalModule from 'ical.js';

// ical.js types declare a default export, but its CommonJS build exports the namespace object itself.
const ICAL = icalModule as unknown as typeof icalModule.default;

type IcalComponent = InstanceType<typeof ICAL.Component>;
type IcalEvent = InstanceType<typeof ICAL.Event>;
type IcalTime = InstanceType<typeof ICAL.Time>;

export interface ParsedHoliday {
  date: string;
  label: string;
}

export class InvalidIcsError extends Error {}

const EXPANSION_YEARS = 2;
const MAX_OCCURRENCES_PER_EVENT = 1000;
const MAX_DAYS_PER_OCCURRENCE = 31;

function timeToDay(time: IcalTime): DateTime {
  return DateTime.utc(time.year, time.month, time.day);
}

function parseCalendar(ics: string): IcalComponent {
  try {
    const root = new ICAL.Component(ICAL.parse(ics) as unknown[]);
    if (root.name === 'vcalendar') return root;
  } catch {
    // reported below as an invalid calendar
  }
  throw new InvalidIcsError();
}

function occurrenceDays(start: IcalTime, end: IcalTime | null): DateTime[] {
  const startDay = timeToDay(start);
  const endDay = end ? timeToDay(end) : startDay;
  const days = [startDay];
  for (
    let day = startDay.plus({ days: 1 });
    day < endDay && days.length < MAX_DAYS_PER_OCCURRENCE;
    day = day.plus({ days: 1 })
  ) {
    days.push(day);
  }
  return days;
}

interface Occurrence {
  start: IcalTime;
  end: IcalTime | null;
  label: string;
}

function eventLabel(event: IcalEvent): string {
  return (event.summary ?? '').trim();
}

function* eventOccurrences(event: IcalEvent, rangeEnd: DateTime): Generator<Occurrence> {
  if (!event.isRecurring()) {
    yield { start: event.startDate, end: event.endDate ?? null, label: eventLabel(event) };
    return;
  }
  const iterator = event.iterator();
  for (let count = 0; count < MAX_OCCURRENCES_PER_EVENT; count++) {
    const next = iterator.next();
    if (!next || timeToDay(next) > rangeEnd) return;
    const details = event.getOccurrenceDetails(next);
    yield { start: details.startDate, end: details.endDate ?? null, label: eventLabel(details.item) };
  }
}

function buildEvents(calendar: IcalComponent): IcalEvent[] {
  const vevents = calendar.getAllSubcomponents('vevent');
  const exceptions = vevents.filter((vevent) => vevent.hasProperty('recurrence-id'));
  const masters = vevents.filter((vevent) => !vevent.hasProperty('recurrence-id'));
  const masterUids = new Set(masters.map((vevent) => vevent.getFirstPropertyValue('uid')));
  const orphanExceptions = exceptions.filter((vevent) => !masterUids.has(vevent.getFirstPropertyValue('uid')));

  const events = masters.map((vevent) => {
    const event = new ICAL.Event(vevent);
    exceptions
      .filter((exception) => exception.getFirstPropertyValue('uid') === event.uid)
      .forEach((exception) => event.relateException(exception));
    return event;
  });
  return [...events, ...orphanExceptions.map((vevent) => new ICAL.Event(vevent))];
}

export function parseIcsHolidays(ics: string, today: DateTime = DateTime.utc()): ParsedHoliday[] {
  const calendar = parseCalendar(ics);
  const rangeStart = today.startOf('day').minus({ years: EXPANSION_YEARS });
  const rangeEnd = today.startOf('day').plus({ years: EXPANSION_YEARS });
  const holidays = new Map<string, string>();

  for (const event of buildEvents(calendar)) {
    if (!event.startDate) continue;
    for (const { start, end, label } of eventOccurrences(event, rangeEnd)) {
      for (const day of occurrenceDays(start, end)) {
        if (day < rangeStart || day > rangeEnd) continue;
        const date = day.toISODate()!;
        if (!holidays.has(date)) holidays.set(date, label);
      }
    }
  }

  return [...holidays.entries()].map(([date, label]) => ({ date, label })).sort((a, b) => a.date.localeCompare(b.date));
}
