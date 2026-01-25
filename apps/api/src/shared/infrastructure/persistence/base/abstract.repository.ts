import { Logger } from "@nestjs/common"

import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel"
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity"

import { BaseEntity } from "./base.entity"

/**
 * 저장소(Repository) 추상 클래스
 * 모든 저장소 구현체는 이 인터페이스를 구현해야 함
 */
export abstract class AbstractRepository<T extends BaseEntity<T>> {
  protected abstract readonly logger: Logger

  constructor(
    protected readonly entityRepository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  /**
   * 엔티티 생성
   */
  abstract create(entity: T): Promise<T>

  /**
   * 조건에 맞는 단일 엔티티 조회
   */
  abstract findOne(where: FindOptionsWhere<T>, options?: { relations?: string[] }): Promise<T>

  /**
   * 조건에 맞는 단일 엔티티 조회 및 업데이트
   */
  abstract findOneAndUpdate(where: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<T>

  /**
   * 조건에 맞는 모든 엔티티 조회
   */
  abstract findAll(where: FindOptionsWhere<T>): Promise<T[]>

  /**
   * 조건에 맞는 단일 엔티티 조회 및 삭제
   */
  abstract findOneAndDelete(where: FindOptionsWhere<T>): Promise<any>

  /**
   * 조건에 맞는 엔티티 소프트 삭제
   */
  abstract softDelete(where: FindOptionsWhere<T>): Promise<any>

  /**
   * 조건에 맞는 소프트 삭제된 엔티티 복구
   */
  abstract restore(where: FindOptionsWhere<T>): Promise<any>

  /**
   * 트랜잭션 실행
   */
  abstract executeTransaction<R>(
    isolationLevel: IsolationLevel,
    operation: (entityManager: EntityManager) => Promise<R>,
  ): Promise<R>

  /**
   * 조건에 맞는 엔티티 개수 조회
   */
  abstract count(where: FindOptionsWhere<T>): Promise<number>

  /**
   * 여러 엔티티 일괄 생성
   */
  abstract bulkCreate(entities: T[]): Promise<T[]>

  /**
   * 조건에 맞는 엔티티 일괄 업데이트
   */
  abstract bulkUpdate(where: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>): Promise<number>

  /**
   * 조건에 맞는 엔티티 일괄 삭제
   */
  abstract bulkDelete(where: FindOptionsWhere<T>): Promise<number>
}
