import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsString } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';

export class ExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  paymentMethod: string;

  @IsArray()
  @Type(() => String)
  taxes: string[];

  @IsDateString()
  date: string;
}

export class RecurringExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  paymentMethod: string;

  @IsBoolean()
  status: boolean;

  @IsArray()
  @Type(() => String)
  taxes: string[];

  @IsDateString()
  startDate: string;

  @IsRRule()
  recurrenceRule: string;
}
