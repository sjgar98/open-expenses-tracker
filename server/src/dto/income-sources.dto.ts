import { IsString } from 'class-validator';

export class IncomeSourceDto {
  @IsString()
  name: string;

  @IsString()
  color: string;
}
