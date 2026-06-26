import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { PaymentMethodDto } from 'src/dto/payment-methods.dto';
import { ProtectedAuthGuard } from '../auth/guards/protected.guard';
import { LoggedUser } from 'src/entities/user.entity';

@Controller('payment-methods')
@UseGuards(ProtectedAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getUserPaymentMethods(@Request() req): Promise<PaymentMethod[]> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.getUserPaymentMethods(user);
  }

  @Get(':paymentMethodUuid')
  async getUserPaymentMethodByUuid(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string
  ): Promise<PaymentMethod> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.getUserPaymentMethodByUuid(user, paymentMethodUuid);
  }

  @Post()
  async createUserPaymentMethod(@Request() req, @Body() paymentMethodDto: PaymentMethodDto): Promise<PaymentMethod> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.createUserPaymentMethod(user, paymentMethodDto);
  }

  @Put(':paymentMethodUuid')
  async updateUserPaymentMethod(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string,
    @Body() paymentMethodDto: PaymentMethodDto
  ): Promise<PaymentMethod> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.updateUserPaymentMethod(user, paymentMethodUuid, paymentMethodDto);
  }

  @Delete(':paymentMethodUuid')
  async deleteUserPaymentMethod(@Request() req, @Param('paymentMethodUuid') paymentMethodUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.deleteUserPaymentMethod(user, paymentMethodUuid);
  }

  @Patch(':paymentMethodUuid/restore')
  async restoreUserPaymentMethod(@Request() req, @Param('paymentMethodUuid') paymentMethodUuid: string): Promise<void> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.restoreUserPaymentMethod(user, paymentMethodUuid);
  }
}

