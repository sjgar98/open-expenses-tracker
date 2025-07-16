import { IsNumber, IsString } from 'class-validator';

export class AccountDto {
  @IsString()
  name: string;

  @IsNumber()
  balance: number;

  @IsNumber()
  currency: number;
}
