import * as Joi from "joi"
import { databaseSchema } from "./database"
// import { jwtSchema } from "./jwt/jwt.schema"
// import { redisSchema } from "./redis/redis.schema"

export const validationSchema = Joi.object({
  ...databaseSchema,
  // ...jwtSchema,
  // ...redisSchema,
})
