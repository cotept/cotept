import { Module } from "@nestjs/common"
import { ConfigService, ConfigModule as NestConfigModule } from "@nestjs/config"
import { configuration } from "./configuration"
import { nosqlConfig } from "./nosql/nosql.config"
import { validationSchema } from "./validation.schema"

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "local"}`,
      load: [configuration, nosqlConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true, // 알 수 없는 환경 변수 허용
        abortEarly: false, // 모든 검증 오류 수집
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
