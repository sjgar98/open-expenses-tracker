import { IsString } from 'class-validator';

export class ExpenseCategoryDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsString()
  iconColor: string;
}

