import { IsolationLevel } from "typeorm/driver/types/IsolationLevel"

/**
 * 트랜잭션 격리 수준 정의
 * SQL 표준의 네 가지 격리 수준을 지원
 *
 * "READ UNCOMMITTED": 가장 낮은 격리 수준, 더티 리드 발생 가능
 * "READ COMMITTED": 커밋된 데이터만 읽기 가능
 * "REPEATABLE READ": 트랜잭션 동안 같은 데이터 읽기 보장
 * "SERIALIZABLE": 가장 높은 격리 수준, 완벽한 데이터 일관성 보장
 */

/**
 * 트랜잭션 옵션 인터페이스
 */
export interface TransactionOptions {
  isolationLevel?: IsolationLevel
}
