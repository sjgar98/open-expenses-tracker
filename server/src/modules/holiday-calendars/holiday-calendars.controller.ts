import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { HolidayCalendarDto, IcsFetchDto, IcsParseDto } from 'src/dto/holiday-calendars.dto';
import { HolidayCalendar } from 'src/entities/holiday-calendar.entity';
import { LoggedUser } from 'src/entities/user.entity';
import { ParsedHoliday } from 'src/utils/ics.parser';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { HolidayCalendarsService } from './holiday-calendars.service';

@Controller('holiday-calendars')
@UseGuards(ProtectedAuthGuard)
export class HolidayCalendarsController {
  constructor(private readonly holidayCalendarsService: HolidayCalendarsService) {}

  @Get()
  async getUserHolidayCalendars(@Request() req): Promise<HolidayCalendar[]> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.getUserHolidayCalendars(user);
  }

  @Post('parse-ics')
  parseIcs(@Body() icsDto: IcsParseDto): ParsedHoliday[] {
    return this.holidayCalendarsService.parseIcs(icsDto.ics);
  }

  @Post('fetch-ics')
  async fetchIcs(@Body() icsDto: IcsFetchDto): Promise<ParsedHoliday[]> {
    return this.holidayCalendarsService.fetchIcs(icsDto.url);
  }

  @Get(':calendarUuid')
  async getUserHolidayCalendarByUuid(
    @Request() req,
    @Param('calendarUuid') calendarUuid: string
  ): Promise<HolidayCalendar> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.getUserHolidayCalendarByUuid(user, calendarUuid);
  }

  @Post()
  async createUserHolidayCalendar(@Request() req, @Body() calendarDto: HolidayCalendarDto): Promise<HolidayCalendar> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.createUserHolidayCalendar(user, calendarDto);
  }

  @Put(':calendarUuid')
  async updateUserHolidayCalendar(
    @Request() req,
    @Param('calendarUuid') calendarUuid: string,
    @Body() calendarDto: HolidayCalendarDto
  ): Promise<HolidayCalendar> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.updateUserHolidayCalendar(user, calendarUuid, calendarDto);
  }

  @Delete(':calendarUuid')
  async deleteUserHolidayCalendar(@Request() req, @Param('calendarUuid') calendarUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.deleteUserHolidayCalendar(user, calendarUuid);
  }

  @Patch(':calendarUuid/restore')
  async restoreUserHolidayCalendar(@Request() req, @Param('calendarUuid') calendarUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.holidayCalendarsService.restoreUserHolidayCalendar(user, calendarUuid);
  }
}
