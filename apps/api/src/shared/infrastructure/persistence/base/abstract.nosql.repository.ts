import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common"

/**
 * NoSQL 데이터베이스를 위한 추상 레포지토리
 * AbstractRepository와 비슷한 인터페이스 제공
 */
export abstract class AbstractNoSQLRepository<T> {
  protected abstract readonly logger: Logger
  protected abstract readonly tableName: string

  /**
   * ID로 엔티티 조회
   */
  async findOne(id: string): Promise<T> {
    return this.executeOperation(async () => {
      const entity = await this.findById(id)

      if (!entity) {
        this.logger.warn(`Entity not found with id ${id}`)
        throw new NotFoundException("Entity not found.")
      }

      return entity
    })
  }

  /**
   * 모든 엔티티 조회
   */
  async findAll(filter: Partial<Record<string, any>> = {}): Promise<T[]> {
    return this.executeOperation(() => this.find(filter))
  }

  /**
   * 새 엔티티 생성
   */
  async create(entity: T): Promise<T> {
    return this.executeOperation(async () => {
      await this.saveEntity(entity)
      return entity
    })
  }

  /**
   * 엔티티 업데이트
   */
  async update(id: string, partialEntity: Partial<T>): Promise<T> {
    return this.executeOperation(async () => {
      const entity = await this.findById(id)

      if (!entity) {
        this.logger.warn(`Entity not found with id ${id}`)
        throw new NotFoundException("Entity not found.")
      }

      const updatedEntity = { ...entity, ...partialEntity } as T
      await this.saveEntity(updatedEntity)
      return updatedEntity
    })
  }

  /**
   * 엔티티 삭제
   */
  async delete(id: string): Promise<boolean> {
    return this.executeOperation(async () => {
      const result = await this.deleteEntity(id)
      
      if (!result) {
        throw new NotFoundException(`Entity not found`)
      }
      
      return result
    })
  }

  /**
   * count 조회
   */
  async count(filter: Partial<Record<string, any>> = {}): Promise<number> {
    return this.executeOperation(async () => {
      const entities = await this.find(filter)
      return entities.length
    })
  }

  // 에러 처리 로직
  protected async executeOperation<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation()
    } catch (error) {
      this.handleDBError(error)
    }
  }

  // DB 에러 핸들러
  protected handleDBError(error: any): never {
    this.logger.error("NoSQL Database operation failed", error)

    // NoSQL 에러 코드 처리
    if (error.errorCode) {
      switch (error.errorCode) {
        case 'IllegalArgument':
          throw new BadRequestException(error.message)
        case 'TableNotFound':
          throw new NotFoundException('Table not found')
        case 'IndexNotFound':
          throw new NotFoundException('Index not found')
        case 'ResourceExists':
          throw new ConflictException('Entity already exists')
        case 'RowSizeLimitExceeded':
          throw new BadRequestException('Row size limit exceeded')
      }
    }

    // 이미 NestJS HttpException인 경우 그대로 전달
    if (error.status && error.message) {
      throw error
    }

    throw new InternalServerErrorException('NoSQL Database operation failed')
  }

  // 구현해야하는 추상 메서드
  protected abstract findById(id: string): Promise<T | null>;
  protected abstract find(filter: Partial<Record<string, any>>): Promise<T[]>;
  protected abstract saveEntity(entity: T): Promise<void>;
  protected abstract deleteEntity(id: string): Promise<boolean>;
}
