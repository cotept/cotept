import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { PaginatedResult, PaginationOptions } from "@repo/shared/src/pagination"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel"
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity"
import { BaseEntity } from "../../entities/base.entity"

export abstract class AbstractRepository<T extends BaseEntity<T>> {
  protected abstract readonly logger: Logger

  constructor(
    private readonly entityRepository: Repository<T>,
    private readonly entityManager: EntityManager,
  ) {}

  // error wrapper
  protected async executeOperation<R>(operation: () => Promise<R>): Promise<R> {
    try {
      return await operation()
    } catch (error) {
      this.handleDBError(error)
    }
  }
  // DB error handler
  protected handleDBError(error: any): never {
    this.logger.error("Database operation failed", error)

    switch (error.code) {
      case "23505": // PostgreSQL unique violation
        throw new ConflictException("Entity already exists")
      case "23503": // PostgreSQL foreign key violation
        throw new BadRequestException("Related entity not found")
    }

    throw new InternalServerErrorException("Database operation failed")
  }

  async create(entity: T): Promise<T> {
    return this.executeOperation(() => this.entityManager.save(entity))
  }

  async findOne(where: FindOptionsWhere<T>, options?: { relations?: string[] }): Promise<T> {
    return this.executeOperation(async () => {
      const entity = await this.entityRepository.findOne({ where, relations: options?.relations })

      if (!entity) {
        this.logger.warn("Entity not found with where", where)
        throw new NotFoundException("Entity not found.")
      }

      return entity
    })
  }

  async findOneAndUpdate(where: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<T> {
    return this.executeOperation(async () => {
      const updateResult = await this.entityRepository.update(where, partialEntity)

      if (!updateResult.affected) {
        this.logger.warn("Entity not found with where", where)
        throw new NotFoundException("Entity not found.")
      }

      return this.findOne(where)
    })
  }

  async findAll(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.executeOperation(() => this.entityRepository.findBy(where))
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    return this.executeOperation(async () => {
      const result = await this.entityRepository.delete(where)

      if (result.affected === 0) {
        throw new NotFoundException(`Entity not found`)
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
}
