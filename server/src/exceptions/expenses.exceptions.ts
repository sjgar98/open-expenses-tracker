import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpenseNotFoundException extends HttpException {
  constructor() {
    super('expenses.errors.expenseNotFound', HttpStatus.NOT_FOUND);
  }
}

export class RecurringExpenseNotFoundException extends HttpException {
  constructor() {
    super('expenses.errors.recurringExpenseNotFound', HttpStatus.NOT_FOUND);
  }
}

