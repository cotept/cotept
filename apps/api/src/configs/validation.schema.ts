import * as Joi from "joi"

import { nosqlSchema } from "./nosql/nosql.schema"
import { ociSchema } from "./oci/oci.schema"
import { redisSchema } from "./redis/redis.schema"
import { databaseSchema } from "./database"
import { mailSchema } from "./mail"
import { githubSchema, googleSchema } from "./social-provider"
import { authCodeSchema, clentUrlSchema, jwtSchema } from "./token"

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("local", "development", "test", "production").default("development"),
  PORT: Joi.number().default(3005),
  ...databaseSchema,
  ...redisSchema,
  ...nosqlSchema,
  ...ociSchema,
  ...jwtSchema,
  ...authCodeSchema,
  ...clentUrlSchema,
  ...githubSchema,
  ...googleSchema,
  ...mailSchema,
})
