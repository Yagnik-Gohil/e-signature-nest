import * as Joi from 'joi';

export const createUserDocumentSchema = Joi.object({
  user: Joi.string().uuid().required(),
  document: Joi.string().uuid().required(),
  role: Joi.string().required(),
});

export const updateUserDocumentSchema = Joi.object({
  role: Joi.string().required(),
});

export const updateSequenceSchema = Joi.object({
  sequence: Joi.number().required(),
});

export const createSignatureBoxSchema = Joi.object({
  user_document: Joi.array().items({
    id: Joi.string().uuid().required(),
  }),
});
