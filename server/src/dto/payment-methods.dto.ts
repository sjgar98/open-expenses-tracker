import { IsBoolean, IsHexColor, IsString, MinLength, ValidateIf } from 'class-validator';
import { IsRRule } from 'src/decorators/is-rrule.decorator';

export class PaymentMethodDto {
  @IsString({ message: 'paymentMethods.errors.nameRequired' })
  @MinLength(1, { message: 'paymentMethods.errors.nameRequired' })
  name: string;

  @IsBoolean()
  credit: boolean;

  @IsString()
  icon: string;

  @IsHexColor()
  iconColor: string;

  @IsString()
  account: string;

  @ValidateIf((o) => o.credit)
  @IsRRule({ message: 'paymentMethods.errors.creditClosingDateRuleInvalid' })
  creditClosingDateRule?: string;

  @ValidateIf((o) => o.credit)
  @IsRRule({ message: 'paymentMethods.errors.creditDueDateRuleInvalid' })
  creditDueDateRule?: string;
}

