import * as Joi from "joi"

export const googleSchema = {
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CLIENT_CALLBACK_URL: Joi.string().required(),
}
