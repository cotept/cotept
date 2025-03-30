// import { RedisConfig } from "@/configs/redis"
// import { createKeyv } from "@keyv/redis"
// import { CacheModule as NestCacheModule } from "@nestjs/cache-manager"
// import { Global, Module } from "@nestjs/common"
// import { ConfigModule, ConfigService } from "@nestjs/config"

// @Global()
// @Module({
//   imports: [
//     ConfigModule,
//     NestCacheModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => {
//         const redisConfig = configService.getOrThrow<RedisConfig>("redis")

//         const redisUrl = redisConfig.password
//           ? `redis://:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`
//           : `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`

//         return {
//           store: createKeyv(redisUrl, {
//             namespace: redisConfig.namespace,
//           }),
//           ttl: redisConfig.ttl,
//         }
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   exports: [NestCacheModule],
// })
// export class CacheModule {}

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
