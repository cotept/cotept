import { NoSQLClientOptions } from "@/shared/infrastructure/persistence/nosql/client/nosql-client.interface"
import { registerAs } from "@nestjs/config"

/**
 * NoSQL 설정
 */
export interface NoSQLConfig extends NoSQLClientOptions {}

export const nosqlConfig = registerAs("nosql", (): NoSQLConfig => {
  // 필수 환경 변수 검사
  const compartmentId = process.env.OCI_COMPARTMENT_ID
  if (!compartmentId) {
    throw new Error("OCI_COMPARTMENT_ID environment variable is required")
  }

  return {
    endpoint: process.env.OCI_NOSQL_ENDPOINT || "https://nosql.ap-seoul-1.oci.oraclecloud.com",
    compartment: compartmentId,
    auth: {
      iam: {
        configProvider: process.env.OCI_CONFIG_PROFILE || "DEFAULT",
      },
    },
    // 추가 설정 (선택 사항)
    timeout: parseInt(process.env.OCI_NOSQL_TIMEOUT || "30000"),
    poolMin: parseInt(process.env.OCI_NOSQL_POOL_MIN || "1"),
    poolMax: parseInt(process.env.OCI_NOSQL_POOL_MAX || "10"),
    // 테이블 기본 설정
    defaults: {
      tableLimits: {
        readUnits: parseInt(process.env.OCI_NOSQL_READ_UNITS || "10"),
        writeUnits: parseInt(process.env.OCI_NOSQL_WRITE_UNITS || "10"),
        storageGB: parseInt(process.env.OCI_NOSQL_STORAGE_GB || "1"),
      },
    },
  }
})
