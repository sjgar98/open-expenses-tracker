import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';
import { PaginationDto } from './pagination.dto';

export class ExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  paymentMethod: string;

  @IsString()
  category: string;

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

  @IsString()
  category: string;

  @IsBoolean()
  status: boolean;

  @IsArray()
  @Type(() => String)
  taxes: string[];

  @IsRRule()
  recurrenceRule: string;
}

export class ExpenseFilterDto extends PaginationDto {
  @IsIn(['date'])
  sortBy: 'date';

  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';

  @IsOptional()
  @IsDateString()
  rangeStart?: string;

  @IsOptional()
  @IsDateString()
  rangeEnd?: string;
}

export class RecurringExpenseFilterDto extends PaginationDto {
  @IsIn(['nextOccurrence'])
  sortBy: 'nextOccurrence';

  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}

