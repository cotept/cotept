import { Region } from "oracle-nosqldb"

/**
 * Oracle NoSQL Database 클라이언트 설정 옵션
 *
 * Oracle NoSQL Database SDK의 공식 설정을 기반으로 합니다.
 * @see https://oracle.github.io/nosql-node-sdk/classes/NoSQLClient.html
 */
export interface NoSQLClientOptions {
  // OCI NoSQL 연결 엔드포인트
  endpoint?: string

  // OCI 리전
  region?: string | Region

  // 컴파트먼트 ID
  compartment?: string

  // 인증 설정
  auth: {
    iam: {
      // IAM 인증 제공자 설정
      configProvider: any
      // 선택적 프로필 이름
      profileName?: string
    }
  }

  // 타임아웃 설정 (밀리초)
  timeout?: number
  ddlTimeout?: number
  tablePollTimeout?: number

  // 연결 풀 설정
  poolMin?: number
  poolMax?: number

  // 테이블 생성시 사용할 기본 값
  defaults?: {
    tableLimits?: {
      readUnits: number
      writeUnits: number
      storageGB: number
    }
  }
}
