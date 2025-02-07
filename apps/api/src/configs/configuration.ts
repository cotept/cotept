import { databaseConfig } from "./database"
// import { jwtConfig } from "./jwt/jwt.config"
// import { redisConfig } from "./redis/redis.config"

export const configuration = () => ({
  database: databaseConfig(),
  // jwt: jwtConfig(),
  // redis: redisConfig(),
})
