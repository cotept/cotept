import { Global, Logger, Module } from "@nestjs/common"
import { ConfigModule as NestConfigModule } from "@nestjs/config"

import { configuration } from "./configuration"
import { validationSchema } from "./validation.schema"

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [...(process.arch === "arm64" ? [".env.arm64"] : []), `.env.${process.env.NODE_ENV}`, ".env"],
      validationSchema: validationSchema,
      load: [configuration],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

// 서버 초기화 메타데이터 로깅
const logger = new Logger(ConfigModule.name)
const envFiles = [...(process.arch === "arm64" ? [".env.arm64"] : []), `.env.${process.env.NODE_ENV}`, ".env"]

logger.log("=" + "=".repeat(58) + "=")
logger.log("SERVER INITIALIZATION METADATA")
logger.log("=" + "=".repeat(58) + "=")
logger.log(`Working Directory: ${__dirname}`)
logger.log(`Architecture: ${process.arch}`)
logger.log(`Environment: ${process.env.NODE_ENV}`)
logger.log(`Config Files: ${envFiles.join(" → ")}`)
logger.log(`Database: ${process.env.DB_DATABASE}`)
logger.log(`NoSQL Endpoint: ${process.env.OCI_NOSQL_ENDPOINT}`)
logger.log("=" + "=".repeat(58) + "=")
