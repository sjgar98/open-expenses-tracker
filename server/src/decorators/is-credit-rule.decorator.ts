import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { isResolvableRulePair, normalizeClosingRule, normalizeDueRule } from 'src/utils/credit-cycle.engine';

function ruleValidator(name: string, normalize: (value: unknown) => unknown) {
  return function (validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
      registerDecorator({
        name,
        target: object.constructor,
        propertyName,
        constraints: [],
        options: validationOptions,
        validator: {
          validate: (value: unknown) => normalize(value) !== null,
          defaultMessage: () => `${propertyName} is not a valid rule`,
        },
      });
    };
  };
}

export const IsClosingRule = ruleValidator('isClosingRule', normalizeClosingRule);
export const IsDueRule = ruleValidator('isDueRule', normalizeDueRule);

export function IsResolvableWithClosingRule(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isResolvableWithClosingRule',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          const closingRule = normalizeClosingRule((args.object as Record<string, unknown>).creditClosingDateRule);
          const dueRule = normalizeDueRule(value);
          return !closingRule || !dueRule || isResolvableRulePair(closingRule, dueRule);
        },
        defaultMessage: () => `${propertyName} can't be an offset of an offset closing rule`,
      },
    });
  };
}
