import { Injectable } from '@nestjs/common';

/**
 * 기본 NoSQL 매퍼 추상 클래스
 * 도메인 엔티티와 NoSQL 문서 간의 변환을 담당하는 매퍼의 기본 클래스
 */
@Injectable()
export abstract class BaseNoSQLMapper<T, D> {
  /**
   * NoSQL 문서를 도메인 엔티티로 변환
   */
  abstract toDomain(document: D): T;

  /**
   * 도메인 엔티티를 NoSQL 문서로 변환
   */
  abstract toDocument(entity: T): D;

  /**
   * 현재 시간을 ISO 문자열로 반환
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * TTL 계산 (Unix 타임스탬프, 초 단위)
   */
  protected calculateTTL(hours: number): number {
    return Math.floor(Date.now() / 1000) + (hours * 60 * 60);
  }

  /**
   * 특정 시간으로부터 TTL 계산 (Unix 타임스탬프, 초 단위)
   */
  protected calculateTTLFromTimestamp(timestamp: string, hours: number): number {
    const date = new Date(timestamp);
    return Math.floor(date.getTime() / 1000) + (hours * 60 * 60);
  }
}
