import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import databaseConfig from './database/database.config';
import appConfig from './app/app.config';
import ociConfig from './oci/oci.config';
import nosqlConfig from './nosql/nosql.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().default(3000),
      }),
      load: [
        appConfig,
        databaseConfig,
        ociConfig,
        nosqlConfig, // NoSQL 설정 추가
      ],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
