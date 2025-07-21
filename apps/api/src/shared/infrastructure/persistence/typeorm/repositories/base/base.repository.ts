import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common"

import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel"
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity"

import { AbstractRepository } from "../../../base/abstract.repository"
import { BaseEntity } from "../../../base/base.entity"

import { PaginatedResult, PaginationOptions } from "@/shared/infrastructure/dto/api-response.dto"

export class BaseRepository<T extends BaseEntity<T>> extends AbstractRepository<T> {
  protected readonly logger: Logger

  constructor(
    protected readonly entityRepository: Repository<T>,
    protected readonly entityManager: EntityManager,
    protected readonly serviceName: string,
  ) {
    super(entityRepository, entityManager)
    this.logger = new Logger(`${serviceName}Repository`)
  }

  // error wrapper
  protected async executeOperation<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation()
    } catch (error) {
      this.handleDBError(error, `[${this.serviceName}]`)
    }
  }

  // DB error handler
  protected handleDBError(error: unknown, prefix: string = ""): never {
    this.logger.error(`${prefix} Database operation failed`, error)

    // 타입 가드 및 단언
    if (error && typeof error === "object" && "code" in error) {
      const dbError = error as { code: string }

      switch (dbError.code) {
        case "ORA-00001": // Oracle unique violation
          throw new ConflictException(`${prefix} Entity already exists`)
        case "ORA-02291": // Oracle foreign key violation
          throw new BadRequestException(`${prefix} Related entity not found`)
        case "ORA-02292": // Oracle foreign key constraint violation (child record exists)
          throw new BadRequestException(`${prefix} Cannot delete entity - related records exist`)
      }
    }

    throw new InternalServerErrorException(`${prefix} Database operation failed`)
  }

  async create(entity: T): Promise<T> {
    this.logger.debug(`[${this.serviceName}] Creating entity`)
    return this.executeOperation(() => this.entityManager.save(entity))
  }

  async findOne(where: FindOptionsWhere<T>, options?: { relations?: string[] }): Promise<T> {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Finding entity with where`, where)
      const entity = await this.entityRepository.findOne({ where, relations: options?.relations })

      if (!entity) {
        this.logger.warn(`[${this.serviceName}] Entity not found with where`, where)
        throw new NotFoundException(`[${this.serviceName}] Entity not found.`)
      }

      return entity
    })
  }

  async findOneAndUpdate(where: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<T> {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Updating entity with where`, where)
      const updateResult = await this.entityRepository.update(where, partialEntity)

      if (!updateResult.affected) {
        this.logger.warn(`[${this.serviceName}] Entity not found with where`, where)
        throw new NotFoundException(`[${this.serviceName}] Entity not found.`)
      }

      return this.findOne(where)
    })
  }

  async findAll(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.executeOperation(() => this.entityRepository.findBy(where))
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Deleting entity with where`, where)
      const result = await this.entityRepository.delete(where)

      if (result.affected === 0) {
        this.logger.warn(`[${this.serviceName}] Entity not found for deletion with where`, where)
        throw new NotFoundException(`[${this.serviceName}] Entity not found`)
      }

      return result
    })
  }

  async softDelete(where: FindOptionsWhere<T>) {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.softDelete(where)

      if (result.affected === 0) {
        throw new NotFoundException(`Entity not found`)
      }

      return result
    })
  }

  async restore(where: FindOptionsWhere<T>) {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.restore(where)

      if (result.affected === 0) {
        throw new NotFoundException(`Entity not found or already restored`)
      }

      return result
    })
  }

  async executeTransaction<R>(
    isolationLevel: IsolationLevel = "SERIALIZABLE",
    operation: (entityManager: EntityManager) => Promise<R>,
  ): Promise<R> {
    this.logger.debug(`[${this.serviceName}] Executing transaction with isolation level: ${isolationLevel}`)
    return this.executeOperation(() =>
      this.entityManager.transaction<R>(isolationLevel, async (transactionalEntityManager) => {
        return operation(transactionalEntityManager)
      }),
    )
  }

  async count(where: FindOptionsWhere<T>): Promise<number> {
    return this.executeOperation(() => this.entityRepository.count({ where }))
  }

  async bulkCreate(entities: T[]): Promise<T[]> {
    return this.executeOperation(() => this.entityManager.save(entities))
  }

  async bulkUpdate(where: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<number> {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.update(where, partialEntity)
      return result.affected || 0
    })
  }

  async bulkDelete(where: FindOptionsWhere<T>): Promise<number> {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.delete(where)
      return result.affected || 0
    })
  }

  async paginate(where: FindOptionsWhere<T>, options: PaginationOptions): Promise<PaginatedResult<T>> {
    return this.executeOperation(async () => {
      const [items, totalItemCount] = await this.entityRepository.findAndCount({
        where,
        skip: (options.currentPage - 1) * options.limit,
        take: options.limit,
      })

      return {
        items,
        totalItemCount,
        currentPage: options.currentPage,
        limit: options.limit,
        totalPageCount: Math.ceil(totalItemCount / options.limit),
      }
    })
  }

  // 추가 유틸리티 메서드 (확장 기능)

  async findByIds(ids: string[]): Promise<T[]> {
    return this.executeOperation(async () => {
      const entities = await this.entityRepository.findBy({
        id: ids,
      } as unknown as FindOptionsWhere<T>)

      if (!entities.length) {
        this.logger.warn(`No entities found with ids: ${ids.join(", ")}`)
      }

      return entities
    })
  }

  async paginateWithSort(
    where: FindOptionsWhere<T>,
    options: PaginationOptions & { sort?: { field: string; order: "ASC" | "DESC" } },
  ): Promise<PaginatedResult<T>> {
    return this.executeOperation(async () => {
      const queryBuilder = this.entityRepository
        .createQueryBuilder("entity")
        .where(where)
        .skip((options.currentPage - 1) * options.limit)
        .take(options.limit)

      if (options.sort) {
        queryBuilder.orderBy(`entity.${options.sort.field}`, options.sort.order)
      }

      const [items, totalItemCount] = await queryBuilder.getManyAndCount()

      return {
        items,
        totalItemCount,
        currentPage: options.currentPage,
        limit: options.limit,
        totalPageCount: Math.ceil(totalItemCount / options.limit),
      }
    })
  }

  async executeTransactionWithRetry<R>(
    isolationLevel: IsolationLevel = "SERIALIZABLE",
    operation: (entityManager: EntityManager) => Promise<R>,
    maxRetries = 3,
  ): Promise<R> {
    let lastError: unknown = new Error("Transaction failed")

    this.logger.debug(
      `[${this.serviceName}] Starting transaction with retry (max: ${maxRetries}, isolation: ${isolationLevel})`,
    )

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTransaction(isolationLevel, operation)
      } catch (error) {
        // PostgreSQL의 직렬화 실패 에러 코드: 40001
        const err = error as { code?: string } // 타입 단언
        if (err.code === "40001" && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100 // 지수 백오프
          this.logger.warn(
            `[${this.serviceName}] Transaction serialization failure, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`,
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          lastError = error
        } else {
          this.logger.error(`[${this.serviceName}] Transaction failed with error:`, error)
          throw error
        }
      }
    }

    this.logger.error(`[${this.serviceName}] Transaction failed after ${maxRetries} attempts`)
    throw lastError
  }
}
