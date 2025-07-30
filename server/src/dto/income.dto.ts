import { IsBoolean, IsDateString, IsNumber, IsString, Min } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';

export class IncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  account: string;

  @IsDateString()
  date: string;
}

export class RecurringIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  account: string;

  @IsBoolean()
  status: boolean;

  @IsDateString()
  startDate: string;

  @IsRRule()
  recurrenceRule: string;
}

