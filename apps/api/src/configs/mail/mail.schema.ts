import * as Joi from "joi"

export const mailSchema = {
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_MAIL_FROM: Joi.string().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_MAX_CONNECTIONS: Joi.number().required(),
  SMTP_MAX_MASSAGE: Joi.number().required(),
  SMTP_RATE_DELTA: Joi.number().required(),
}
