import * as Joi from "joi"

/**
 * OCI 설정 유효성 검증 스키마
 * Joi 스키마를 사용하여 OCI 관련 환경 변수 값 검증
 */
export const ociSchema = {
  // OCI 인증 설정
  OCI_TENANCY_ID: Joi.string().required().description("OCI 테넌시 ID (OCID 형식)"),
  OCI_USER_ID: Joi.string().required().description("OCI 사용자 ID (OCID 형식)"),
  OCI_FINGERPRINT: Joi.string().required().description("OCI API 키 지문"),
  OCI_REGION: Joi.string().required().description("OCI 리전 (예: ap-chuncheon-1)"),

  // OCI 프라이빗 키 (둘 중 하나 필수)
  OCI_PRIVATE_KEY: Joi.string().description("OCI 프라이빗 키 (PEM 형식)"),
  OCI_PRIVATE_KEY_PATH: Joi.string().description("OCI 프라이빗 키 파일 경로"),

  // OCI 오브젝트 스토리지 설정 (선택사항)
  OCI_OBJECT_STORAGE_NAMESPACE: Joi.string().description("OCI 오브젝트 스토리지 네임스페이스"),
  OCI_BUCKET_NAME: Joi.string().description("OCI 오브젝트 스토리지 버킷 이름"),
}
