import { IsBoolean, IsHexColor, IsInt, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';
import { IsClosingRule, IsDueRule } from 'src/decorators/is-credit-rule.decorator';
import { IsIsoDate } from 'src/decorators/is-iso-date.decorator';
import type { ClosingRule, DueRule } from 'src/utils/credit-cycle.engine';

export class CreditRulesDto {
  @IsClosingRule({ message: 'paymentMethods.errors.creditClosingDateRuleInvalid' })
  creditClosingDateRule: ClosingRule;

  @IsDueRule({ message: 'paymentMethods.errors.creditDueDateRuleInvalid' })
  creditDueDateRule: DueRule;

  @ValidateIf((o) => o.holidayCalendar != null)
  @IsUUID('all', { message: 'paymentMethods.errors.holidayCalendarInvalid' })
  holidayCalendar?: string | null;
}

export class PaymentMethodDto {
  @IsString({ message: 'paymentMethods.errors.nameRequired' })
  @MinLength(1, { message: 'paymentMethods.errors.nameRequired' })
  name: string;

  @IsInt({ message: 'paymentMethods.errors.sortWeightRequired' })
  sortWeight: number;

  @IsBoolean()
  credit: boolean;

  @IsString()
  icon: string;

  @IsHexColor()
  iconColor: string;

  @IsString()
  account: string;

  @ValidateIf((o) => o.credit)
  @IsClosingRule({ message: 'paymentMethods.errors.creditClosingDateRuleInvalid' })
  creditClosingDateRule?: ClosingRule;

  @ValidateIf((o) => o.credit)
  @IsDueRule({ message: 'paymentMethods.errors.creditDueDateRuleInvalid' })
  creditDueDateRule?: DueRule;

  @ValidateIf((o) => o.credit && o.holidayCalendar != null)
  @IsUUID('all', { message: 'paymentMethods.errors.holidayCalendarInvalid' })
  holidayCalendar?: string | null;
}

export class CreditCycleOverrideDto {
  @IsIsoDate({ message: 'paymentMethods.errors.statementClosingDateInvalid' })
  closingDate: string;

  @IsOptional()
  @IsIsoDate({ message: 'paymentMethods.errors.statementDueDateInvalid' })
  dueDate?: string | null;
}

export class CreditCyclesQueryDto {
  @IsOptional()
  @IsIsoDate()
  from?: string;

  @IsOptional()
  @IsIsoDate()
  to?: string;
}
