import { IsDateString, IsIn, IsNumber, IsOptional } from 'class-validator';

export enum SummaryFilterBy {
  Last3Months = 'last3Months',
  Last6Months = 'last6Months',
  Last12Months = 'last12Months',
}

export class StatsSummaryParamsDto {
  @IsIn(Object.values(SummaryFilterBy))
  filterBy: SummaryFilterBy;
}

export class StatsExpensesByPaymentMethodDto {
  @IsDateString()
  rangeStart: string;

  @IsDateString()
  rangeEnd: string;
}

export class StatsIncomeByAccountDto {
  @IsDateString()
  rangeStart: string;

  @IsDateString()
  rangeEnd: string;
}

