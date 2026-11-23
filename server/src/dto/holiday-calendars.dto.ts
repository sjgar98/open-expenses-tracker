import { Type } from 'class-transformer';
import { IsIsoDate } from 'src/decorators/is-iso-date.decorator';
import { ArrayMaxSize, IsArray, IsString, IsUrl, MaxLength, MinLength, ValidateNested } from 'class-validator';

export const MAX_HOLIDAY_DATES = 5000;
export const MAX_ICS_LENGTH = 2 * 1024 * 1024;

export class HolidayDateDto {
  @IsIsoDate({ message: 'holidayCalendars.errors.dateInvalid' })
  date: string;

  @IsString()
  @MaxLength(255)
  label: string;
}

export class HolidayCalendarDto {
  @IsString({ message: 'holidayCalendars.errors.nameRequired' })
  @MinLength(1, { message: 'holidayCalendars.errors.nameRequired' })
  name: string;

  @IsArray()
  @ArrayMaxSize(MAX_HOLIDAY_DATES, { message: 'holidayCalendars.errors.tooManyDates' })
  @ValidateNested({ each: true })
  @Type(() => HolidayDateDto)
  dates: HolidayDateDto[];
}

export class IcsParseDto {
  @IsString({ message: 'holidayCalendars.errors.icsInvalid' })
  @MaxLength(MAX_ICS_LENGTH, { message: 'holidayCalendars.errors.icsTooLarge' })
  ics: string;
}

export class IcsFetchDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'holidayCalendars.errors.urlInvalid' })
  url: string;
}
