import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class SavingsBucketDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  iconColor: string;

  @IsOptional()
  @IsNumber()
  initialAmount: number | null;

  @IsOptional()
  @IsNumber()
  targetAmount: number | null;

  @IsNumber()
  currency: number;

  @IsOptional()
  @IsDateString()
  deadline: string | null;
}

