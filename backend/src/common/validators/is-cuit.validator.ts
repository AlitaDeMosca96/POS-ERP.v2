import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function isValidCuit(value: string | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  if (!/^\d{11}$/.test(value)) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(value[i], 10) * weights[i];
  }

  const resto = sum % 11;
  const verificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;

  return verificador === parseInt(value[10], 10);
}

export function IsCuit(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCuit',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isValidCuit(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un CUIT válido (11 dígitos con dígito verificador correcto)`;
        },
      },
    });
  };
}