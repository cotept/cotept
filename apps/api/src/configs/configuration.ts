import nosqlConfig from "./nosql/nosql.config"
import ociConfig from "./oci/oci.config"
import { redisConfig } from "./redis/redis.config"
import { databaseConfig } from "./database"
import { mailConfig } from "./mail"
import { OAuthGithubConfig, OAuthGoogleConfig } from "./social-provider"
import { authCodeConfig, clentUrlConfig, jwtConfig } from "./token"

export const configuration = () => ({
  database: databaseConfig(),
  redis: redisConfig(),
  nosql: nosqlConfig(),
  oci: ociConfig(),
  jwt: jwtConfig(),
  authCode: authCodeConfig(),
  clientUrl: clentUrlConfig(),
  github: OAuthGithubConfig(),
  google: OAuthGoogleConfig(),
  mail: mailConfig(),
})
