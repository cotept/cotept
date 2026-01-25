export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  connectString: string
  synchronize: boolean
  ssl: boolean
}

export const databaseConfig = () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1521,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectString: process.env.DB_CONNECTION_STRING,
  // synchronize: process.env.NODE_ENV !== "production" && process.env.DB_SYNCHRONIZE?.toLowerCase() === "true", // 프로덕션 환경에서 주석처리
  // ssl: process.env.NODE_ENV !== "production" && process.env.DB_SSL?.toLowerCase() === "false", // 프로덕션 환경에서 주석처리
  ssl:
    process.env.NODE_ENV === "production"
      ? { ca: process.env.DB_CA, rejectUnauthorized: true } // 인증서 검증 활성화
      : false, // 로컬 개발 환경에서는 SSL 비활성화
})
