import * as Joi from "joi"
import { databaseSchema } from "./database"
// import { nosqlSchema } from "./nosql/nosql.schema"
// import { jwtSchema } from "./jwt/jwt.schema"
import { redisSchema } from "./redis/redis.schema"
import { githubSchema, googleSchema } from "./social-provider"
import { authCodeSchema, clentUrlSchema, jwtSchema } from "./token"

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("local", "development", "test", "production").default("development"),
  PORT: Joi.number().default(3000),
  ...databaseSchema,
  ...redisSchema,
  // ...nosqlSchema,
  ...jwtSchema,
  ...authCodeSchema,
  ...clentUrlSchema,
  ...githubSchema,
  ...googleSchema,
})
