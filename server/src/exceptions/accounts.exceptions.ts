import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotFoundException extends HttpException {
  constructor() {
    super('accounts.errors.accountNotFound', HttpStatus.NOT_FOUND);
  }
}
