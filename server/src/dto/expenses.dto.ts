import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostExpenseDto {
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

export class PatchExpenseDto {
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
  paymentMethod?: string;

  @IsArray()
  @Type(() => String)
  @IsOptional()
  taxes?: string[];

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class PostRecurringExpenseDto {
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

  @IsString()
  recurrenceRule: string;
}

export class PatchRecurringExpenseDto {
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
  paymentMethod?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsArray()
  @Type(() => String)
  @IsOptional()
  taxes?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  recurrenceRule?: string;
}
