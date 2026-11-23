export interface HolidayDate {
  date: string;
  label: string;
}

export interface HolidayCalendar {
  uuid: string;
  name: string;
  dates?: HolidayDate[];
  isDeleted: boolean;
}

export interface HolidayCalendarDto {
  name: string;
  dates: HolidayDate[];
}

export interface HolidayDateDraft {
  date: string | null;
  label: string;
}

export interface HolidayCalendarForm {
  name: string;
  dates: HolidayDateDraft[];
}
