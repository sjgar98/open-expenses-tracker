import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  fromExchangeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  toExchangeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  toCurrency?: number;
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

  @IsRRule()
  recurrenceRule: string;
}

