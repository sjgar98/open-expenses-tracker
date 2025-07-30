import { HttpException, HttpStatus } from '@nestjs/common';

export class TaxNotFoundException extends HttpException {
  constructor() {
    super('taxes.errors.taxNotFound', HttpStatus.NOT_FOUND);
  }
}

