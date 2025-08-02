import { IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class CurrencyDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/)
  code: string;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

export class CurrencyFilterDto extends PaginationDto {
  @IsIn(['visible'])
  sortBy: 'visible';

  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}

