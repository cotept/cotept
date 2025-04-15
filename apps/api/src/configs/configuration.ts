import { databaseConfig } from "./database"
import { redisConfig } from "./redis/redis.config"
import { OAuthGithubConfig, OAuthGoogleConfig } from "./social-provider"
import { authCodeConfig, clentUrlConfig, jwtConfig } from "./token"

export const configuration = () => ({
  database: databaseConfig(),
  redis: redisConfig(),
  jwt: jwtConfig(),
  authCode: authCodeConfig(),
  clientUrl: clentUrlConfig(),
  github: OAuthGithubConfig(),
  google: OAuthGoogleConfig(),
})
