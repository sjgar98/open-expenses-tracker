import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentMethodNotFoundException extends HttpException {
  constructor() {
    super('paymentMethods.errors.paymentMethodNotFound', HttpStatus.NOT_FOUND);
  }
}

export class NotCreditPaymentMethodException extends HttpException {
  constructor() {
    super('paymentMethods.errors.notCredit', HttpStatus.BAD_REQUEST);
  }
}

export class CreditCycleNotFoundException extends HttpException {
  constructor() {
    super('paymentMethods.errors.statementNotFound', HttpStatus.NOT_FOUND);
  }
}

export class StatementDueBeforeClosingException extends HttpException {
  constructor() {
    super('paymentMethods.errors.statementDueBeforeClosing', HttpStatus.BAD_REQUEST);
  }
}
