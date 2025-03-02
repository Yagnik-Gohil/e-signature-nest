import * as Joi from 'joi';

export const contactSchema = Joi.object({
  email: Joi.string().email().required(),
  recipient_name: Joi.string().required(),
});
