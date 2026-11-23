import { HttpException, HttpStatus } from '@nestjs/common';

export class HolidayCalendarNotFoundException extends HttpException {
  constructor() {
    super('holidayCalendars.errors.holidayCalendarNotFound', HttpStatus.NOT_FOUND);
  }
}

export class InvalidIcsException extends HttpException {
  constructor() {
    super('holidayCalendars.errors.icsInvalid', HttpStatus.BAD_REQUEST);
  }
}

export class IcsUrlNotAllowedException extends HttpException {
  constructor() {
    super('holidayCalendars.errors.urlNotAllowed', HttpStatus.BAD_REQUEST);
  }
}

export class IcsTooLargeException extends HttpException {
  constructor() {
    super('holidayCalendars.errors.icsTooLarge', HttpStatus.BAD_REQUEST);
  }
}

export class IcsFetchFailedException extends HttpException {
  constructor() {
    super('holidayCalendars.errors.icsFetchFailed', HttpStatus.BAD_GATEWAY);
  }
}
