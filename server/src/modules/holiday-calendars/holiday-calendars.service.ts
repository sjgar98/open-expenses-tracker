import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HolidayCalendarDto, HolidayDateDto, MAX_ICS_LENGTH } from 'src/dto/holiday-calendars.dto';
import { HolidayCalendar } from 'src/entities/holiday-calendar.entity';
import { HolidayDate } from 'src/entities/holiday-date.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { HolidayCalendarNotFoundException, IcsFetchFailedException, IcsTooLargeException, IcsUrlNotAllowedException, InvalidIcsException, } from 'src/exceptions/holiday-calendars.exceptions';
import { InvalidIcsError, ParsedHoliday, parseIcsHolidays } from 'src/utils/ics.parser';
import { fetchRemoteText, ResponseTooLargeError, UrlNotAllowedError } from 'src/utils/remote-url-fetch';
import { DataSource, Repository } from 'typeorm';
import { CreditScheduleService } from '../payment-methods/credit-schedule.service';

const ICS_FETCH_TIMEOUT_MS = 10_000;
const ICS_FETCH_MAX_REDIRECTS = 3;

@Injectable()
export class HolidayCalendarsService {
  constructor(
    @InjectRepository(HolidayCalendar)
    private readonly holidayCalendarRepository: Repository<HolidayCalendar>,
    private readonly dataSource: DataSource,
    private readonly creditScheduleService: CreditScheduleService,
    private readonly configService: ConfigService
  ) {}

  async getUserHolidayCalendars(user: LoggedUser): Promise<HolidayCalendar[]> {
    const calendars = await this.holidayCalendarRepository.find({
      where: { user: { uuid: user.uuid }, isDeleted: user.settings.showDeletedOptions ? undefined : false },
    });
    return calendars.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUserHolidayCalendarByUuid(user: LoggedUser, calendarUuid: string): Promise<HolidayCalendar> {
    const calendar = await this.holidayCalendarRepository.findOne({
      where: { uuid: calendarUuid, user: { uuid: user.uuid } },
      relations: { dates: true },
      order: { dates: { date: 'ASC' } },
    });
    if (!calendar) throw new HolidayCalendarNotFoundException();
    return calendar;
  }

  async createUserHolidayCalendar(user: LoggedUser, calendarDto: HolidayCalendarDto): Promise<HolidayCalendar> {
    const calendarUuid = await this.dataSource.transaction(async (manager) => {
      const calendar = await manager.save(
        manager.create(HolidayCalendar, { user: { uuid: user.uuid }, name: calendarDto.name, isDeleted: false })
      );
      await this.replaceDates(manager.getRepository(HolidayDate), calendar.uuid, calendarDto.dates);
      return calendar.uuid;
    });
    return this.getUserHolidayCalendarByUuid(user, calendarUuid);
  }

  async updateUserHolidayCalendar(
    user: LoggedUser,
    calendarUuid: string,
    calendarDto: HolidayCalendarDto
  ): Promise<HolidayCalendar> {
    await this.assertOwned(user, calendarUuid);
    await this.dataSource.transaction(async (manager) => {
      await manager.update(HolidayCalendar, calendarUuid, { name: calendarDto.name });
      await this.replaceDates(manager.getRepository(HolidayDate), calendarUuid, calendarDto.dates);
    });
    await this.creditScheduleService.recomputeForCalendar(calendarUuid);
    return this.getUserHolidayCalendarByUuid(user, calendarUuid);
  }

  async deleteUserHolidayCalendar(user: LoggedUser, calendarUuid: string): Promise<void> {
    await this.assertOwned(user, calendarUuid);
    await this.holidayCalendarRepository.update(calendarUuid, { isDeleted: true });
  }

  async restoreUserHolidayCalendar(user: LoggedUser, calendarUuid: string): Promise<void> {
    await this.assertOwned(user, calendarUuid);
    await this.holidayCalendarRepository.update(calendarUuid, { isDeleted: false });
  }

  parseIcs(ics: string): ParsedHoliday[] {
    try {
      return parseIcsHolidays(ics);
    } catch (error) {
      if (error instanceof InvalidIcsError) throw new InvalidIcsException();
      throw error;
    }
  }

  async fetchIcs(url: string): Promise<ParsedHoliday[]> {
    const ics = await fetchRemoteText(url, {
      maxBytes: MAX_ICS_LENGTH,
      timeoutMs: ICS_FETCH_TIMEOUT_MS,
      maxRedirects: ICS_FETCH_MAX_REDIRECTS,
      allowPrivateNetworks: this.configService.get<boolean>('ICS_FETCH_ALLOW_PRIVATE_NETWORKS') === true,
    }).catch((error) => {
      if (error instanceof UrlNotAllowedError) throw new IcsUrlNotAllowedException();
      if (error instanceof ResponseTooLargeError) throw new IcsTooLargeException();
      throw new IcsFetchFailedException();
    });
    return this.parseIcs(ics);
  }

  private async assertOwned(user: LoggedUser, calendarUuid: string): Promise<void> {
    const exists = await this.holidayCalendarRepository.existsBy({ uuid: calendarUuid, user: { uuid: user.uuid } });
    if (!exists) throw new HolidayCalendarNotFoundException();
  }

  private async replaceDates(
    holidayDateRepository: Repository<HolidayDate>,
    calendarUuid: string,
    dates: HolidayDateDto[]
  ): Promise<void> {
    await holidayDateRepository.delete({ calendar: { uuid: calendarUuid } });
    const uniqueDates = new Map(dates.map((holiday) => [holiday.date, holiday.label.trim()]));
    if (!uniqueDates.size) return;
    await holidayDateRepository.insert(
      [...uniqueDates.entries()].map(([date, label]) => ({ calendar: { uuid: calendarUuid }, date, label }))
    );
  }
}
