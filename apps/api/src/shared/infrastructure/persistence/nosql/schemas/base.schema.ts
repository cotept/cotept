/**
 * NoSQL 문서의 기본 인터페이스
 * 모든 NoSQL 문서에 공통적으로 적용되는 속성 정의
 */
export interface BaseNoSQLDocument {
  timestamp: string // 문서 생성/수정 시간
  ttl?: number // 문서 만료 시간 (Unix 타임스탬프, 초 단위)
}

/**
 * 실시간 통신 테이블 문서 기본 인터페이스
 */
export interface RealtimeCommunicationDocument extends BaseNoSQLDocument {
  sessionId: string // 파티션 키
  type: string // 정렬 키
  data: Record<string, any> // 문서 데이터
}

/**
 * 사용자 활동 테이블 문서 기본 인터페이스
 */
export interface UserActivityDocument extends BaseNoSQLDocument {
  userId: string // 파티션 키
  type: string // 정렬 키
  data: Record<string, any> // 문서 데이터
}

/**
 * 시스템 운영 테이블 문서 기본 인터페이스
 */
export interface SystemOperationsDocument extends BaseNoSQLDocument {
  componentId: string // 파티션 키
  timestamp: string // 정렬 키
  type: string // 이벤트/메트릭 유형
  data: Record<string, any> // 문서 데이터
}
