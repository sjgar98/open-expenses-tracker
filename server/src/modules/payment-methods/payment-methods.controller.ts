import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { PaymentMethodDto } from 'src/dto/payment-methods.dto';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';

@Controller('payment-methods')
@UseGuards(ProtectedAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getUserPaymentMethods(@Request() req): Promise<PaymentMethod[]> {
    const userUuid: string = req.user.uuid;
    return this.paymentMethodsService.getUserPaymentMethods(userUuid);
  }

  @Post()
  async createUserPaymentMethod(@Request() req, @Body() paymentMethodDto: PaymentMethodDto): Promise<PaymentMethod> {
    const userUuid: string = req.user.uuid;
    return this.paymentMethodsService.createUserPaymentMethod(userUuid, paymentMethodDto);
  }

  @Put(':paymentMethodUuid')
  async updateUserPaymentMethod(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string,
    @Body() paymentMethodDto: PaymentMethodDto
  ): Promise<PaymentMethod> {
    const userUuid: string = req.user.uuid;
    return this.paymentMethodsService.updateUserPaymentMethod(userUuid, paymentMethodUuid, paymentMethodDto);
  }

  @Delete(':paymentMethodUuid')
  async deleteUserPaymentMethod(@Request() req, @Param('paymentMethodUuid') paymentMethodUuid: string): Promise<void> {
    const userUuid: string = req.user.uuid;
    return this.paymentMethodsService.deleteUserPaymentMethod(userUuid, paymentMethodUuid);
  }
}
