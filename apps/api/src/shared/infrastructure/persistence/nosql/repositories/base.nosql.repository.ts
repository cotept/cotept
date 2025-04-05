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
  DeleteOpResult,
  ErrorCode,
  FieldValue,
  NoSQLArgumentError,
  NoSQLAuthorizationError,
  NoSQLClient,
  NoSQLError,
  NoSQLServiceError,
  NoSQLTimeoutError,
  PutOpResult,
} from "oracle-nosqldb"
import { AbstractNoSQLRepository } from "../../base/abstract.nosql.repository"
import { OCI_NOSQL_CLIENT } from "../client/nosql-client.provider"

/**
 * Oracle NoSQL 데이터베이스 레포지토리 기본 구현
 *
 * Oracle NoSQL SDK의 기본 CRUD 기능을 구현합니다.
 * 참조: https://oracle.github.io/nosql-node-sdk/classes/NoSQLClient.html
 */
export abstract class BaseNoSQLRepository<T extends Record<string, FieldValue>> extends AbstractNoSQLRepository<T> {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(
    @Inject(OCI_NOSQL_CLIENT) protected readonly client: NoSQLClient,
    protected readonly tableName: string,
  ) {
    super()
  }

  /**
   * ID로 엔티티 조회
   */
  async getById(id: string): Promise<T> {
    return this.executeOperation(async () => {
      const key = this.getKeyObject(id)
      const result = await this.client.get(this.tableName, key)

      if (!result.row) {
        throw new NotFoundException(`Entity with id ${id} not found`)
      }

      return result.row as T
    })
  }

  /**
   * 조건에 맞는 엔티티 목록 조회
   */
  async getAll(filter: Partial<Record<string, FieldValue>> = {}): Promise<T[]> {
    return this.executeOperation(async () => {
      // 전체 테이블 쿼리
      const query = `SELECT * FROM ${this.tableName}`
      const result = await this.client.query(query)

      // 결과에서 필터 조건에 맞는 항목만 필터링
      if (Object.keys(filter).length === 0) {
        return result.rows as T[]
      }

      return result.rows.filter((row) => {
        for (const [key, value] of Object.entries(filter)) {
          if (row[key] !== value) {
            return false
          }
        }
        return true
      }) as T[]
    })
  }

  /**
   * 사용자 정의 쿼리 실행
   */
  async query(query: string): Promise<T[]> {
    return this.executeOperation(async () => {
      const result = await this.client.query(query)
      return result.rows as T[]
    })
  }

  /**
   * 엔티티 생성
   */
  async create(entity: T): Promise<T> {
    return this.executeOperation(async () => {
      await this.client.put(this.tableName, entity)
      return entity
    })
  }

  /**
   * 엔티티 수정
   * @param id 수정할 엔티티의 ID
   * @param partialEntity 수정할 필드가 포함된 부분 엔티티
   */
  async update(id: string, partialEntity: Partial<T>): Promise<T> {
    return this.executeOperation(async () => {
      // 먼저 기존 엔티티를 가져옵니다
      const key = this.getKeyObject(id)
      const result = await this.client.get(this.tableName, key)

      if (!result.row) {
        throw new NotFoundException(`Entity with id ${id} not found`)
      }

      // 부분 업데이트를 위해 기존 엔티티와 새 필드를 병합합니다
      const updatedEntity = { ...result.row, ...partialEntity } as T

      // 업데이트된 엔티티를 저장합니다
      await this.client.put(this.tableName, updatedEntity)
      return updatedEntity
    })
  }

  /**
   * 엔티티 삭제
   */
  async delete(id: string): Promise<boolean> {
    return this.executeOperation(async () => {
      const key = this.getKeyObject(id)
      const result = await this.client.delete(this.tableName, key)

      if (!result.success) {
        throw new NotFoundException(`Entity with id ${id} not found`)
      }

      return result.success
    })
  }

  /**
   * 조건에 맞는 엔티티 개수 조회
   */
  async count(filter: Partial<Record<string, FieldValue>> = {}): Promise<number> {
    return this.executeOperation(async () => {
      const entities = await this.getAll(filter)
      return entities.length
    })
  }

  /**
   * 여러 엔티티 일괄 생성
   */
  async createBatch(entities: T[]): Promise<T[]> {
    return this.executeOperation(async () => {
      await this.client.putMany(this.tableName, entities)
      return entities
    })
  }

  /**
   * 여러 엔티티 일괄 삭제
   */
  async deleteBatch(ids: string[]): Promise<(DeleteOpResult<AnyRow> | PutOpResult<AnyRow>)[]> {
    return this.executeOperation(async () => {
      const keys = ids.map((id) => this.getKeyObject(id))
      const result = await this.client.deleteMany(this.tableName, keys)
      return result.results || []
    })
  }

  /**
   * 범위 삭제 (필요한 경우에만 사용)
   */
  async deleteRange(partialKey: Partial<Record<string, FieldValue>>, fieldRange?: any): Promise<number> {
    return this.executeOperation(async () => {
      const result = await this.client.deleteRange(this.tableName, partialKey, { fieldRange })
      return result.deletedCount
    })
  }

  /**
   * 공통 연산 실행 래퍼
   * 에러 처리 로직을 중앙화합니다.
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
   * NoSQL 에러를 적절한 HTTP 예외로 변환합니다.
   */
  protected handleDBError(error: unknown): never {
    if (error instanceof NoSQLArgumentError) {
      this.logger.error(`Invalid argument: error.message`)
      throw new BadRequestException(error.message)
    } else if (error instanceof NoSQLTimeoutError) {
      this.logger.error(`Timeout: error.message`)
      throw new InternalServerErrorException("Database operation timed out")
    } else if (error instanceof NoSQLServiceError) {
      this.logger.error(`Service error: error.message`)
      throw new InternalServerErrorException("NoSQL service error")
    } else if (error instanceof NoSQLAuthorizationError) {
      this.logger.error(`Authorization error: error.message`)
      throw new InternalServerErrorException("Authorization error")
    } else if (error instanceof NoSQLError) {
      this.logger.error(`NoSQL error: error.message`)

      // NoSQL 에러 코드 처리
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
      this.logger.error(`Unknown error: error.message`)

      // 이미 NestJS HttpException인 경우 그대로 전달
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
   * ID로 키 객체 생성
   * 복합키 사용 시 오버라이드
   */
  protected getKeyObject(id: string): Record<string, any> {
    return { id }
  }
}
