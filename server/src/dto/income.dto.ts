import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';
import { PaginationDto } from './pagination.dto';

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

  @IsString()
  source: string;

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

  @IsString()
  source: string;

  @IsBoolean()
  status: boolean;

  @IsRRule()
  recurrenceRule: string;
}

export class IncomeFilterDto extends PaginationDto {
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

export class RecurringIncomeFilterDto extends PaginationDto {
  @IsIn(['nextOccurrence'])
  sortBy: 'nextOccurrence';

  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}

