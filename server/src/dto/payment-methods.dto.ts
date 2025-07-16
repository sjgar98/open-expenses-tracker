import { IsBoolean, IsString, ValidateIf } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';

export class PaymentMethodDto {
  @IsString()
  name: string;

  @IsBoolean()
  credit: boolean;

  @ValidateIf((o) => o.credit)
  @IsRRule()
  creditClosingDateRule?: string;

  @ValidateIf((o) => o.credit)
  @IsRRule()
  creditDueDateRule?: string;
}
