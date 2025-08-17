import * as dotenv from "dotenv"
import { DataSource } from "typeorm"

import { databaseConfig } from "../database"

import "tsconfig-paths/register"

// CLI 실행시 환경변수 로드
const isProd = process.env.NODE_ENV === "production"

const envFile = `.env.${process.env.NODE_ENV || "local"}`
dotenv.config({ path: envFile })

const config = databaseConfig()

export default new DataSource({
  type: "oracle",
  ...config,
  entities: [
    isProd
      ? "dist/**/infrastructure/adapter/out/persistence/entities/*.entity{.ts,.js}"
      : "src/**/infrastructure/adapter/out/persistence/entities/*.entity{.ts,.js}",
  ],
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
