import { Logger } from "@nestjs/common"
import {
  AnyRow,
  DeleteOpt,
  DeleteResult,
  FieldRange,
  GetOpt,
  NoSQLArgumentError,
  NoSQLClient,
  NoSQLServiceError,
  PreparedStatement,
  PutOpt,
  PutResult,
  QueryOpt,
  QueryResult,
  RowKey,
  TableDDLOpt,
  TableLimits,
  TableResult,
  TableUsageResult,
  WriteMultipleOpt,
  WriteMultipleResult,
} from "oracle-nosqldb"

/**
 * Oracle NoSQL 데이터베이스를 위한 추상 레포지토리 인터페이스
 * 공식 타입을 적극적으로 활용하여, 타입 안정성과 실전 호환성을 높임
 */
export abstract class AbstractNoSQLRepository<TData extends AnyRow, TKey extends RowKey<TData> = RowKey<TData>> {
  protected abstract readonly logger: Logger
  protected abstract readonly tableName: string
  protected abstract readonly nosqlClient: NoSQLClient

  /**
   * ID(PK)로 엔티티 조회
   */
  abstract getById(key: TKey, opt?: GetOpt): Promise<TData | null>

  /**
   * 조건에 맞는 모든 엔티티 조회 (쿼리 + Consistency 지원)
   */
  abstract getAll(query?: string, opt?: QueryOpt): Promise<TData[]>

  /**
   * 새 엔티티 생성 (Put 옵션/결과 타입 적용)
   */
  abstract create(entity: TData, opt?: PutOpt): Promise<PutResult<TData>>

  /**
   * 엔티티 부분 업데이트 (UPDATE 쿼리 활용, 결과는 QueryResult)
   */
  abstract update(key: TKey, updateFields: Partial<TData>, opt?: QueryOpt): Promise<QueryResult<TData>>

  /**
   * 엔티티 삭제 (Delete 옵션/결과 타입 적용)
   */
  abstract delete(key: TKey, opt?: DeleteOpt): Promise<DeleteResult<TData>>

  /**
   * 조건에 맞는 엔티티 개수 조회 (쿼리 활용)
   */
  abstract count(query?: string, opt?: QueryOpt): Promise<number>

  /**
   * 사용자 정의 쿼리 실행 (PreparedStatement/QueryOpt 지원)
   */
  abstract query(statement: string | PreparedStatement, opt?: QueryOpt): Promise<QueryResult<TData>>

  /**
   * 여러 엔티티 일괄 생성 (PutMany/WriteMultiple 지원)
   */
  abstract createBatch(entities: TData[], opt?: WriteMultipleOpt): Promise<WriteMultipleResult<TData>>

  /**
   * 여러 엔티티 일괄 삭제 (deleteMany/multiDelete 지원)
   */
  abstract deleteBatch(keys: TKey[], opt?: WriteMultipleOpt): Promise<WriteMultipleResult<TData>>

  /**
   * 부분 PK/범위로 다건 삭제 (multiDelete)
   */
  abstract deleteRange(partialKey: Partial<TKey>, fieldRange?: FieldRange): Promise<number>

  /**
   * 테이블 상태/정보 조회 (TableResult, TableState 등)
   */
  abstract getTableInfo(opt?: TableDDLOpt): Promise<TableResult>

  /**
   * 테이블 생성/수정 (DDL, TableLimits 등)
   */
  abstract createOrUpdateTable(ddl: string, tableLimits: TableLimits, opt?: TableDDLOpt): Promise<TableResult>

  /**
   * 테이블 사용량/용량 조회 (ConsumedCapacityResult)
   */
  abstract getTableUsageInfo(): Promise<TableUsageResult>

  /**
   * 에러 타입 명시 (공식 에러 타입 활용)
   */
  protected handleError(error: unknown): never {
    if (error instanceof NoSQLArgumentError) {
      this.logger.error("NoSQLArgumentError", error)
    } else if (error instanceof NoSQLServiceError) {
      this.logger.error("NoSQLServiceError", error)
    } else {
      this.logger.error("Unknown NoSQL error", error)
    }
    throw error
  }
}
