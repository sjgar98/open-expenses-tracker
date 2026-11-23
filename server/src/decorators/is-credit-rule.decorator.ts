import { registerDecorator, ValidationOptions } from 'class-validator';
import { normalizeClosingRule, normalizeDueRule } from 'src/utils/credit-cycle.engine';

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
