import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { CreditCycleOverrideDto, CreditCyclesQueryDto, CreditRulesDto, PaymentMethodDto, } from 'src/dto/payment-methods.dto';
import { Cycle } from 'src/utils/credit-cycle.engine';
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

  @Post('preview-cycles')
  async previewCycles(@Request() req, @Body() rulesDto: CreditRulesDto): Promise<Cycle[]> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.previewCycles(user, rulesDto);
  }

  @Get(':paymentMethodUuid/cycles')
  async getUserPaymentMethodCycles(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string,
    @Query() query: CreditCyclesQueryDto
  ): Promise<Cycle[]> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.getUserPaymentMethodCycles(user, paymentMethodUuid, query);
  }

  @Post(':paymentMethodUuid/cycles')
  async createUserCreditCycleOverride(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string,
    @Body() overrideDto: CreditCycleOverrideDto
  ): Promise<void> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.createUserCreditCycleOverride(user, paymentMethodUuid, overrideDto);
  }

  @Delete(':paymentMethodUuid/cycles/:cycleUuid')
  async deleteUserCreditCycleOverride(
    @Request() req,
    @Param('paymentMethodUuid') paymentMethodUuid: string,
    @Param('cycleUuid') cycleUuid: string
  ): Promise<void> {
    const user: LoggedUser = req.user;
    return this.paymentMethodsService.deleteUserCreditCycleOverride(user, paymentMethodUuid, cycleUuid);
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

