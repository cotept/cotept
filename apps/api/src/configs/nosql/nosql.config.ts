import { registerAs } from "@nestjs/config"

/**
 * NoSQL 연결 설정 인터페이스
 */
export interface NoSQLConnectionConfig {
  endpoint: string
  compartmentId: string
  region: string
}

/**
 * NoSQL 클라이언트 설정 인터페이스
 */
export interface NoSQLClientConfig {
  readUnits: number
  writeUnits: number
  storageGB: number
  timeout: number
  poolMin: number
  poolMax: number
}

/**
 * NoSQL 데이터베이스 설정
 */
export default registerAs("nosql", () => ({
  // 테이블 이름
  tables: {
    realtimeCommunication: process.env.NOSQL_TABLE_REALTIME_COMMUNICATION || "realtime_communication",
    userActivity: process.env.NOSQL_TABLE_USER_ACTIVITY || "user_activity",
    systemOperations: process.env.NOSQL_TABLE_SYSTEM_OPERATIONS || "system_operations",
  },

  // TTL 설정 (시간 단위)
  ttl: {
    session: parseInt(process.env.NOSQL_TTL_SESSION || "24", 10),
    userActivity: parseInt(process.env.NOSQL_TTL_USER_ACTIVITY || "72", 10),
    systemOperations: parseInt(process.env.NOSQL_TTL_SYSTEM_OPERATIONS || "168", 10),
  },

  // 연결 설정
  connection: {
    endpoint: process.env.OCI_NOSQL_ENDPOINT || "https://nosql.{region}.oci.customer.com",
    compartmentId: process.env.OCI_COMPARTMENT_ID || "",
    region: process.env.OCI_REGION || "",
  } as NoSQLConnectionConfig,

  // NoSQL 클라이언트 설정
  client: {
    readUnits: parseInt(process.env.OCI_NOSQL_READ_UNITS || "50", 10),
    writeUnits: parseInt(process.env.OCI_NOSQL_WRITE_UNITS || "50", 10),
    storageGB: parseInt(process.env.OCI_NOSQL_STORAGE_GB || "25", 10),
    timeout: parseInt(process.env.OCI_NOSQL_TIMEOUT || "30000", 10),
    poolMin: parseInt(process.env.OCI_NOSQL_POOL_MIN || "1", 10),
    poolMax: parseInt(process.env.OCI_NOSQL_POOL_MAX || "5", 10),
  } as NoSQLClientConfig,
}))
