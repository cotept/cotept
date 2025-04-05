import { Logger } from "@nestjs/common";
import { FieldValue } from "oracle-nosqldb";

/**
 * NoSQL 데이터베이스를 위한 추상 레포지토리 인터페이스
 * 모든 NoSQL 레포지토리가 구현해야 하는 기본 메소드를 정의합니다.
 */
export abstract class AbstractNoSQLRepository<T extends Record<string, FieldValue>> {
  protected abstract readonly logger: Logger;
  protected abstract readonly tableName: string;

  /**
   * ID로 엔티티 조회
   */
  abstract getById(id: string): Promise<T>;

  /**
   * 조건에 맞는 모든 엔티티 조회
   */
  abstract getAll(filter?: Partial<Record<string, FieldValue>>): Promise<T[]>;

  /**
   * 새 엔티티 생성
   */
  abstract create(entity: T): Promise<T>;

  /**
   * 엔티티 업데이트
   */
  abstract update(id: string, partialEntity: Partial<T>): Promise<T>;

  /**
   * 엔티티 삭제
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * 조건에 맞는 엔티티 개수 조회
   */
  abstract count(filter?: Partial<Record<string, FieldValue>>): Promise<number>;

  /**
   * 사용자 정의 쿼리 실행
   */
  abstract query(query: string): Promise<T[]>;

  /**
   * 여러 엔티티 일괄 생성
   */
  abstract createBatch(entities: T[]): Promise<T[]>;

  /**
   * 여러 엔티티 일괄 삭제
   */
  abstract deleteBatch(ids: string[]): Promise<any>;
}
