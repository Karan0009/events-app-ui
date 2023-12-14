import Joi from 'joi';

export const createEventSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  startDateTime: Joi.date().required(),
  endDateTime: Joi.date().required(),
  address: Joi.string().required(),
  guests: Joi.array().required(),
  notification: Joi.string().required(),
  reminder: Joi.string().required(),
});
