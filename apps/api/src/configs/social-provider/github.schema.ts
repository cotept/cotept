import * as Joi from "joi"

export const githubSchema = {
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CLIENT_CALLBACK_URL: Joi.string().required(),
}
