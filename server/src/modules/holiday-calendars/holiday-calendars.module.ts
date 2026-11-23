import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayCalendar } from 'src/entities/holiday-calendar.entity';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { HolidayCalendarsController } from './holiday-calendars.controller';
import { HolidayCalendarsService } from './holiday-calendars.service';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayCalendar]), PaymentMethodsModule],
  controllers: [HolidayCalendarsController],
  providers: [HolidayCalendarsService],
})
export class HolidayCalendarsModule {}
