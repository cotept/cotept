import * as Joi from "joi"
import { databaseSchema } from "./database"
// import { nosqlSchema } from "./nosql/nosql.schema"
// import { jwtSchema } from "./jwt/jwt.schema"
// import { redisSchema } from "./redis/redis.schema"

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("local", "development", "test", "production").default("development"),
  PORT: Joi.number().default(3000),
  ...databaseSchema,
  // ...nosqlSchema,
  // ...jwtSchema,
  // ...redisSchema,
})
