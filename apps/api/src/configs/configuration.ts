import { databaseConfig } from "./database"
import { redisConfig } from "./redis/redis.config"
// import { jwtConfig } from "./jwt/jwt.config"

export const configuration = () => ({
  database: databaseConfig(),
  redis: redisConfig(),
  // jwt: jwtConfig(),
})
