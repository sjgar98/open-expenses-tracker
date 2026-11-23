import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from 'src/entities/payment-method.entity';
import { HolidayCalendar } from 'src/entities/holiday-calendar.entity';
import { HolidayDate } from 'src/entities/holiday-date.entity';
import { CreditCycle } from 'src/entities/credit-cycle.entity';
import { CreditScheduleService } from './credit-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, HolidayCalendar, HolidayDate, CreditCycle])],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, CreditScheduleService],
  exports: [CreditScheduleService],
})
export class PaymentMethodsModule {}
