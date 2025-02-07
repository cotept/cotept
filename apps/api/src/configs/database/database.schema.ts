import * as Joi from "joi"

export const databaseSchema = {
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.string().valid("true", "false").required(),
  // DB_SYNCHRONIZE: Joi.boolean().required(),
  DB_SSL: Joi.boolean().default(false),
}
