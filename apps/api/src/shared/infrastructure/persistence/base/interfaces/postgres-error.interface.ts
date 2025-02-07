/**
 * PostgreSQL 에러 타입 정의
 * PostgreSQL 에러 코드와 관련 정보를 포함
 */
export interface PostgresError {
  code: string // PostgreSQL 에러 코드
  detail?: string // 상세 에러 메시지
  table?: string // 에러가 발생한 테이블
  constraint?: string // 제약 조건 이름
}

/**
 * PostgreSQL 에러 타입 가드
 * unknown 타입의 에러가 PostgreSQL 에러인지 확인
 */
export function isPostgresError(error: unknown): error is PostgresError {
  return error !== null && typeof error === "object" && "code" in error
}
