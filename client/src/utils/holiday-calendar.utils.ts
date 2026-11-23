import type { HolidayCalendar, HolidayCalendarDto, HolidayCalendarForm, HolidayDate, HolidayDateDraft, } from '../model/holiday-calendars';

export const EMPTY_HOLIDAY_CALENDAR_FORM: HolidayCalendarForm = { name: '', dates: [] };

export function toHolidayCalendarDto(form: HolidayCalendarForm): HolidayCalendarDto {
  return {
    name: form.name,
    dates: form.dates
      .filter((holiday): holiday is HolidayDate => !!holiday.date)
      .map((holiday) => ({ date: holiday.date, label: holiday.label.trim() })),
  };
}

export function toHolidayCalendarForm(calendar: HolidayCalendar): HolidayCalendarForm {
  return {
    name: calendar.name,
    dates: (calendar.dates ?? []).map(({ date, label }) => ({ date, label })),
  };
}

function byDate(a: HolidayDateDraft, b: HolidayDateDraft): number {
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.localeCompare(b.date);
}

export function mergeHolidayDates(
  current: HolidayDateDraft[],
  imported: HolidayDate[]
): { dates: HolidayDateDraft[]; added: number } {
  const existing = new Set(current.map((holiday) => holiday.date));
  const additions = imported.filter((holiday) => !existing.has(holiday.date));
  return { dates: [...current, ...additions].sort(byDate), added: additions.length };
}
