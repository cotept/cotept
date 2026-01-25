import * as dotenv from "dotenv"
import { DataSource } from "typeorm"

import { databaseConfig } from "../database"

import "tsconfig-paths/register"
import { ALL_ENTITIES } from "@/shared/infrastructure/persistence/typeorm/entities.registry"

// CLI 실행시 환경변수 로드
const isProd = process.env.NODE_ENV === "production"

const envFile = `.env.${process.env.NODE_ENV || "local"}`
dotenv.config({ path: envFile })

const archEnvFile = `.env.${process.arch}`
dotenv.config({ path: archEnvFile, override: true })

const config = databaseConfig()

export default new DataSource({
  type: "oracle",
  ...config,
  entities: ALL_ENTITIES,
  migrations: [
    isProd
      ? "dist/shared/infrastructure/persistence/migrations/*{.ts,.js}"
      : "src/shared/infrastructure/persistence/migrations/*.ts",
  ],
  // synchronize: process.env.NODE_ENV === "local",
  logging: process.env.NODE_ENV === "local", // 개발 환경에서만 로깅
  logger: "advanced-console", // 더 자세한 로깅 정보
  migrationsTableName: "migrations",
})
