import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { createKeyv } from "@keyv/redis"
import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { Cacheable } from "cacheable"

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "CACHE_INSTANCE",
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.getOrThrow("redis")

        const redisUrl = redisConfig.password
          ? `redis://:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`
          : `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`

        const secondary = createKeyv(redisUrl, {
          namespace: redisConfig.namespace,
        })

        return new Cacheable({ secondary, ttl: redisConfig.ttl })
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ["CACHE_INSTANCE", CacheService],
})
export class CacheModule {}
