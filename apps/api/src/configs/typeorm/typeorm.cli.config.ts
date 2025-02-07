import * as dotenv from "dotenv"
import "tsconfig-paths/register"
import { DataSource } from "typeorm"
import { databaseConfig } from "../database"

// CLI 실행시 환경변수 로드
const isProd = process.env.NODE_ENV === "production"

const envFile = `.env.${process.env.NODE_ENV || "local"}`
dotenv.config({ path: envFile })

const config = databaseConfig()

export default new DataSource({
  type: "postgres",
  ...config,
  entities: [isProd ? "dist/**/*.entity{.ts,.js}" : "src/**/*.entity{.ts,.js}"],
  migrations: [
    isProd
      ? "dist/shared/infrastructure/persistence/migrations/*{.ts,.js}"
      : "src/shared/infrastructure/persistence/migrations/*.ts",
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === "local", // 개발 환경에서만 로깅
  logger: "advanced-console", // 더 자세한 로깅 정보
  migrationsTableName: "migrations",
})
