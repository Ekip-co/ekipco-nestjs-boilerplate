/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EkipException } from '../exceptions/ekip.exception';

// noinspection JSMethodCanBeStatic
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // noinspection JSDeprecatedSymbols
    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new EkipException(this.errorHandling(errors), 400);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private errorHandling(errors: ValidationError[]): string {
    let errorMessage;

    if (errors[0].constraints)
      errorMessage = Object.values(errors[0].constraints)[0];
    else if (errors[0].children.length > 0)
      errorMessage = Object.values(
        Object.values(errors[0].children)[0].children[0].constraints,
      )[0];

    return errorMessage;
  }
}
