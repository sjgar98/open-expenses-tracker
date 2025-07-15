import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  account: string;

  @IsDateString()
  date: string;
}

export class PatchIncomeDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  currency?: number;

  @IsString()
  @IsOptional()
  account?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class PostRecurringIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  account: string;

  @IsBoolean()
  status: boolean;

  @IsDateString()
  startDate: string;

  @IsString()
  recurrenceRule: string;
}

export class PatchRecurringIncomeDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  currency?: number;

  @IsString()
  @IsOptional()
  account?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;
}
