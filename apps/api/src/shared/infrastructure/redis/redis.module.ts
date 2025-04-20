import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        
        return new Redis({
          host: redisConfig.host || 'localhost',
          port: redisConfig.port || 6379,
          db: redisConfig.db || 0,
          password: redisConfig.password,
          keyPrefix: redisConfig.namespace ? `${redisConfig.namespace}:` : '',
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
