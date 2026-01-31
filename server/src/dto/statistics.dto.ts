import { IsDateString, IsIn } from 'class-validator';

export enum SummaryFilterBy {
  Last3Months = 'last3Months',
  Last6Months = 'last6Months',
  Last12Months = 'last12Months',
}

export enum UpcomingExpensesFilterBy {
  OneDay = 'oneDay',
  ThreeDays = 'threeDays',
  SevenDays = 'sevenDays',
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

export class StatsUpcomingExpensesDto {
  @IsIn(Object.values(UpcomingExpensesFilterBy))
  filterBy: UpcomingExpensesFilterBy;
}

export class StatsExpensesHeatmapDto {
  @IsDateString()
  rangeStart: string;

  @IsDateString()
  rangeEnd: string;
}
