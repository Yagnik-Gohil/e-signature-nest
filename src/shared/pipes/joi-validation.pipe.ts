import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  transform(value: object) {
    const { error } = this.schema.validate(value, { abortEarly: true });
    if (error) {
      const errorMessage = error.details[0].message.replace(/['"]/g, '');
      throw new BadRequestException(errorMessage);
    }
    return value;
  }
}
