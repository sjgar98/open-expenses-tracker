import { HttpException, HttpStatus } from '@nestjs/common';

export class SavingNotFoundException extends HttpException {
  constructor() {
    super('savings.errors.savingNotFound', HttpStatus.NOT_FOUND);
  }
}

