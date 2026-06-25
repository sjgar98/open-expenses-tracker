import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class SavingDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  currency: number;

  @IsString()
  bucket: string;

  @IsDateString()
  date: string;
}

export class SavingFilterDto extends PaginationDto {
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

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}

