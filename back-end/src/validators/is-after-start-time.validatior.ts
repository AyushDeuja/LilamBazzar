import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAfterStartTime(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsAfterStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const startTime = (args.object as any).auction_start_time;
          if (!startTime || !value) return true;
          return new Date(value) > new Date(startTime);
        },
        defaultMessage() {
          return 'End time must be after start time';
        },
      },
    });
  };
}
