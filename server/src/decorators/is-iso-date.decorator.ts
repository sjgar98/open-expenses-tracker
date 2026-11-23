import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches, ValidationOptions } from 'class-validator';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function IsIsoDate(validationOptions?: ValidationOptions) {
  return applyDecorators(IsISO8601({ strict: true }, validationOptions), Matches(ISO_DATE_PATTERN, validationOptions));
}
