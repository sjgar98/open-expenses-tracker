import { HttpException, HttpStatus } from '@nestjs/common';

export class IncomeNotFoundException extends HttpException {
  constructor() {
    super('income.errors.incomeNotFound', HttpStatus.NOT_FOUND);
  }
}

export class RecurringIncomeNotFoundException extends HttpException {
  constructor() {
    super('income.errors.recurringIncomeNotFound', HttpStatus.NOT_FOUND);
  }
}
