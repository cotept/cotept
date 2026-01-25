import * as Joi from "joi"

/**
 * OCI NoSQL 설정 유효성 검증 스키마
 * Joi 스키마를 사용하여 환경 변수 값 검증
 */
export const nosqlSchema = {
  // 필수 설정
  OCI_NOSQL_ENDPOINT: Joi.string()
    // .uri({ scheme: ["https"] })
    .default("https://nosql.ap-chuncheon-1.oci.oraclecloud.com")
    .description("OCI NoSQL 서비스 엔드포인트 URL"),

  OCI_COMPARTMENT_ID: Joi.string().required().description("OCI 컴파트먼트 ID (OCID 형식)"),

  OCI_CONFIG_PROFILE: Joi.string().default("DEFAULT").description("OCI 설정 프로필 이름"),

  // 선택적 설정 - 성능 튜닝
  OCI_NOSQL_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
    .description("NoSQL 작업 타임아웃 (밀리초)"),

  OCI_NOSQL_POOL_MIN: Joi.number().integer().min(1).max(50).default(1).description("연결 풀 최소 크기"),

  OCI_NOSQL_POOL_MAX: Joi.number().integer().min(1).max(100).default(10).description("연결 풀 최대 크기"),

  // 테이블 제한 설정
  OCI_NOSQL_READ_UNITS: Joi.number().integer().min(1).max(50).default(10).description("테이블당 읽기 유닛 수"),

  OCI_NOSQL_WRITE_UNITS: Joi.number().integer().min(1).max(50).default(10).description("테이블당 쓰기 유닛 수"),

  OCI_NOSQL_STORAGE_GB: Joi.number()
    .integer()
    .min(1)
    .max(25) // 무료 티어 제한 25GB
    .default(1)
    .description("테이블당 스토리지 크기 (GB)"),
}
