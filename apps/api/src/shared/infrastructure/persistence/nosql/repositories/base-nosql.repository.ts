import { Inject, Logger } from '@nestjs/common';
import { AbstractNoSQLRepository } from '../../base/abstract.nosql.repository';
import { OCI_NOSQL_CLIENT } from '../client/nosql-client.provider';
import { INoSQLClient } from '../client/nosql-client.interface';

/**
 * NoSQL 레포지토리 기본 구현체
 * 모든 NoSQL 레포지토리의 기본이 되는 클래스
 */
export abstract class BaseNoSQLRepository<T> extends AbstractNoSQLRepository<T> {
  protected readonly logger = new Logger(this.constructor.name);
  
  constructor(
    @Inject(OCI_NOSQL_CLIENT) protected readonly client: INoSQLClient,
    protected readonly tableName: string,
  ) {
    super();
  }

  /**
   * ID로 엔티티 조회
   */
  protected async findById(id: string): Promise<T | null> {
    try {
      const result = await this.client.get(this.tableName, { id });
      return result.row ? this.mapToEntity(result.row) : null;
    } catch (error) {
      this.logger.error(`Error in findById: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 필터로 엔티티 조회
   */
  protected async find(filter: Partial<Record<string, any>> = {}): Promise<T[]> {
    try {
      // 간단한 SQL 쿼리 생성
      const conditions = Object.entries(filter)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${this.getColumnName(key)} = '${value}'`;
          } else if (value === null) {
            return `${this.getColumnName(key)} IS NULL`;
          } else {
            return `${this.getColumnName(key)} = ${value}`;
          }
        })
        .join(' AND ');
      
      const statement = conditions
        ? `SELECT * FROM ${this.tableName} WHERE ${conditions}`
        : `SELECT * FROM ${this.tableName}`;
      
      const result = await this.client.query(statement);
      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      this.logger.error(`Error in find: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 엔티티 저장
   */
  protected async saveEntity(entity: T): Promise<void> {
    try {
      const row = this.mapToRow(entity);
      await this.client.put(this.tableName, row);
    } catch (error) {
      this.logger.error(`Error in saveEntity: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 엔티티 삭제
   */
  protected async deleteEntity(id: string): Promise<boolean> {
    try {
      const result = await this.client.delete(this.tableName, { id });
      return result.success;
    } catch (error) {
      this.logger.error(`Error in deleteEntity: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 속성 이름을 테이블 컬럼 이름으로 변환
   */
  protected getColumnName(propertyName: string): string {
    // 카멜케이스를 스네이크케이스로 변환
    return propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * NoSQL 로우를 도메인 엔티티로 변환 (추상 메서드)
   */
  protected abstract mapToEntity(row: Record<string, any>): T;

  /**
   * 도메인 엔티티를 NoSQL 로우로 변환 (추상 메서드)
   */
  protected abstract mapToRow(entity: T): Record<string, any>;
}
