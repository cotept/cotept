import {
  BadRequestException,
  ConflictException,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import {
  AnyRow,
  DeleteResult,
  ErrorCode,
  FieldRange,
  NoSQLArgumentError,
  NoSQLAuthorizationError,
  NoSQLClient,
  NoSQLError,
  NoSQLServiceError,
  NoSQLTimeoutError,
  PreparedStatement,
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
import { AbstractNoSQLRepository } from "../../base/abstract.nosql.repository"
import { OCI_NOSQL_CLIENT } from "../client/nosql-client.provider"

/**
 * Oracle NoSQL 데이터베이스 레포지토리 기본 구현
 * 공식 타입을 적극적으로 적용한 버전
 */
export abstract class BaseNoSQLRepository<
  TData extends AnyRow,
  TKey extends RowKey<TData> = RowKey<TData>,
> extends AbstractNoSQLRepository<TData, TKey> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    @Inject(OCI_NOSQL_CLIENT) protected readonly nosqlClient: NoSQLClient,
    protected readonly tableName: string,
  ) {
    super()
  }

  /**
   * 테이블 정보 조회
   */
  async getTableInfo(opt?: TableDDLOpt): Promise<TableResult> {
    return this.executeOperation(async () => {
      return this.nosqlClient.getTable(this.tableName, opt)
    })
  }

  /**
   * 테이블 생성 또는 업데이트 (DDL 실행)
   */
  async createOrUpdateTable(ddl: string, tableLimits: TableLimits, opt?: TableDDLOpt): Promise<TableResult> {
    return this.executeOperation(async () => {
      if (opt) {
        return this.nosqlClient.tableDDL(ddl, opt)
      }
      return this.nosqlClient.tableDDL(ddl, { tableLimits })
    })
  }

  /**
   * 테이블 사용량 정보 조회
   */
  async getTableUsageInfo(): Promise<TableUsageResult> {
    return this.executeOperation(async () => {
      return this.nosqlClient.getTableUsage(this.tableName)
    })
  }

  /**
   * PK로 엔티티 조회
   */
  async getById(key: TKey): Promise<TData | null> {
    return this.executeOperation(async () => {
      const result = await this.nosqlClient.get<TData>(this.tableName, key)
      if (!result.row) {
        throw new NotFoundException(`Entity with key ${JSON.stringify(key)} not found`)
      }
      return result.row as TData
    })
  }

  /**
   * 조건에 맞는 엔티티 목록 조회
   */
  async getAll(query?: string): Promise<TData[]> {
    return this.executeOperation(async () => {
      const statement = query ?? `SELECT * FROM ${this.tableName}`
      const result: QueryResult<TData> = await this.nosqlClient.query<TData>(statement)
      return (result.rows ?? []) as TData[]
    })
  }

  /**
   * 사용자 정의 쿼리 실행
   */
  async query(statement: string | PreparedStatement, opt?: QueryOpt): Promise<QueryResult<TData>> {
    return this.executeOperation(async () => {
      return this.nosqlClient.query<TData>(statement, opt)
    })
  }

  /**
   * 엔티티 생성
   */
  async create(entity: TData): Promise<PutResult<TData>> {
    return this.executeOperation(async () => {
      return this.nosqlClient.put<TData>(this.tableName, entity)
    })
  }

  /**
   * 엔티티 부분 업데이트 (get → merge → put)
   */
  async update(key: TKey, updateFields: Partial<TData>): Promise<QueryResult<TData>> {
    return this.executeOperation(async () => {
      const result = await this.nosqlClient.get<TData>(this.tableName, key)
      if (!result.row) {
        throw new NotFoundException(`Entity with key ${JSON.stringify(key)} not found`)
      }
      const updatedEntity = { ...result.row, ...updateFields } as TData
      await this.nosqlClient.put<TData>(this.tableName, updatedEntity)

      // 반환값은 QueryResult<TData>로 맞춤
      return {
        rows: [updatedEntity],
        continuationKey: undefined,
      }
    })
  }

  /**
   * 엔티티 삭제
   */
  async delete(key: TKey): Promise<DeleteResult<TData>> {
    return this.executeOperation(async () => {
      const result = await this.nosqlClient.delete<TData>(this.tableName, key)
      if (!result.success) {
        throw new NotFoundException(`Entity with key ${JSON.stringify(key)} not found`)
      }
      return result
    })
  }

  /**
   * 조건에 맞는 엔티티 개수 조회
   */
  async count(query?: string): Promise<number> {
    return this.executeOperation(async () => {
      const entities = await this.getAll(query)
      return entities.length
    })
  }

  /**
   * 여러 엔티티 일괄 생성
   */
  async createBatch(entities: TData[], opt?: WriteMultipleOpt): Promise<WriteMultipleResult<TData>> {
    return this.executeOperation(async () => {
      const ops = entities.map((entity) => ({
        tableName: this.tableName,
        put: entity,
        abortOnFail: true,
      }))
      return this.nosqlClient.writeMany<TData>(ops, opt)
    })
  }

  /**
   * 여러 엔티티 일괄 삭제
   */
  async deleteBatch(keys: TKey[], opt?: WriteMultipleOpt): Promise<WriteMultipleResult<TData>> {
    return this.executeOperation(async () => {
      return this.nosqlClient.deleteMany<TData>(this.tableName, keys, opt)
    })
  }

  /**
   * 부분 PK/범위로 다건 삭제 (deleteRange)
   */
  async deleteRange(partialKey: Partial<TKey>, fieldRange?: FieldRange): Promise<number> {
    return this.executeOperation(async () => {
      const result = await this.nosqlClient.deleteRange(
        this.tableName,
        partialKey,
        fieldRange ? { fieldRange } : undefined,
      )
      return result.deletedCount ?? 0
    })
  }

  /**
   * 공통 연산 실행 래퍼
   */
  protected async executeOperation<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation()
    } catch (error) {
      this.handleDBError(error)
    }
  }

  /**
   * DB 에러 핸들러
   */
  protected handleDBError(error: unknown): never {
    if (error instanceof NoSQLArgumentError) {
      this.logger.error(`Invalid argument: ${error.message}`)
      throw new BadRequestException(error.message)
    } else if (error instanceof NoSQLTimeoutError) {
      this.logger.error(`Timeout: ${error.message}`)
      throw new InternalServerErrorException("Database operation timed out")
    } else if (error instanceof NoSQLServiceError) {
      this.logger.error(`Service error: ${error.message}`)
      throw new InternalServerErrorException("NoSQL service error")
    } else if (error instanceof NoSQLAuthorizationError) {
      this.logger.error(`Authorization error: ${error.message}`)
      throw new InternalServerErrorException("Authorization error")
    } else if (error instanceof NoSQLError) {
      this.logger.error(`NoSQL error: ${error.message}`)
      if (error.errorCode) {
        switch (error.errorCode) {
          case ErrorCode.ILLEGAL_ARGUMENT:
            throw new BadRequestException(error.message)
          case ErrorCode.TABLE_NOT_FOUND:
            throw new NotFoundException("Table not found")
          case ErrorCode.INDEX_NOT_FOUND:
            throw new NotFoundException("Index not found")
          case ErrorCode.RESOURCE_EXISTS:
            throw new ConflictException("Entity already exists")
          case ErrorCode.ROW_SIZE_LIMIT_EXCEEDED:
            throw new BadRequestException("Row size limit exceeded")
        }
      }
      throw new InternalServerErrorException("NoSQL operation failed")
    } else if (error instanceof Error) {
      this.logger.error(`Unknown error: ${error.message}`)
      if ("status" in error && "message" in error) {
        throw error
      }
      throw new InternalServerErrorException(error.message)
    } else {
      this.logger.error(`Unknown error`, error)
      throw new InternalServerErrorException("Unknown error occurred")
    }
  }

  /**
   * RowKey 생성 (복합키 지원, 필요시 오버라이드)
   */
  protected getKeyObject(id: string | number | object): TKey {
    if (typeof id === "object") return id as TKey
    return { id } as unknown as TKey
  }
}
