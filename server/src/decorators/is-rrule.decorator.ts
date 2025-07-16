import { registerDecorator, ValidationOptions } from 'class-validator';
import { rrulestr } from 'rrule';

export function IsRRule(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRRule',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          try {
            rrulestr(value);
            return true;
          } catch (_) {
            return false;
          }
        },
        defaultMessage() {
          return `${propertyName} must be a valid RRULE string`;
        },
      },
    });
  };
}
