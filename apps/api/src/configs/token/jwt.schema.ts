import * as Joi from "joi"

export const jwtSchema = {
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
}
export const authCodeSchema = {
  AUTH_CODE_LENGTH: Joi.number().required(),
  AUTH_CODE_EXPIRES_IN: Joi.number().required(),
}
export const clentUrlSchema = {
  CLIENT_URL: Joi.string().required(),
  CLIENT_ERROR_URL: Joi.string().required(),
}
