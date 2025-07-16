import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentMethodNotFoundException extends HttpException {
  constructor() {
    super('paymentMethods.errors.paymentMethodNotFound', HttpStatus.NOT_FOUND);
  }
}
