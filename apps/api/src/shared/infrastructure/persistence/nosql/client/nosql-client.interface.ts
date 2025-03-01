/**
 * OCI NoSQL 클라이언트 옵션 인터페이스
 */
export interface NoSQLClientOptions {
  // OCI NoSQL 연결 엔드포인트
  endpoint: string;
  
  // OCI 컴파트먼트 ID
  compartment: string;
  
  // 인증 설정
  auth: {
    iam: {
      // IAM 인증 제공자 설정
      configProvider: any;
      // 선택적 프로필 이름
      profileName?: string;
    };
  };
  
  // 기타 옵션
  timeout?: number;
  poolMin?: number;
  poolMax?: number;
  
  // 테이블 생성시 사용할 기본 값
  defaults?: {
    tableLimits?: {
      readUnits: number;
      writeUnits: number;
      storageGB: number;
    };
  };
}

/**
 * NoSQL 클라이언트 인터페이스
 * 나중에 테스트를 위한 모킹을 쉽게 하기 위해 정의
 */
export interface INoSQLClient {
  get(tableName: string, key: Record<string, any>): Promise<any>;
  put(tableName: string, row: Record<string, any>, options?: any): Promise<any>;
  delete(tableName: string, key: Record<string, any>, options?: any): Promise<any>;
  query(statement: string, options?: any): Promise<any>;
  // 필요한 다른 메서드들 추가
}
