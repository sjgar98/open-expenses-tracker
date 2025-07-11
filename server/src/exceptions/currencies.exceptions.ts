import { HttpException, HttpStatus } from '@nestjs/common';

export class CurrencyNotFoundException extends HttpException {
  constructor() {
    super('Currency not found', HttpStatus.NOT_FOUND);
  }
}

export class CurrencyAlreadyExistsException extends HttpException {
  constructor() {
    super('Currency with this code already exists', HttpStatus.BAD_REQUEST);
  }
}

export class CurrencyInvalidCodeException extends HttpException {
  constructor() {
    super('Currency code must be a 3-letter ISO code', HttpStatus.BAD_REQUEST);
  }
}
