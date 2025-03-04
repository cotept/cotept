// apps/api/src/modules/user/infrastructure/persistence/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/user';

/**
 * User 도메인과 Entity 간의 변환을 담당하는 매퍼 클래스
 * class-transformer를 사용하여 변환 처리
 */
@Injectable()
export class UserMapper {
  /**
   * UserEntity를 User 도메인 객체로 변환합니다.
   * @param entity 변환할 UserEntity 객체
   * @returns User 도메인 객체
   */
  toDomain(entity: UserEntity): User {
    // 엔티티를 일반 객체로 변환 (데코레이터 기반 변환)
    const plainEntity = instanceToPlain(entity);
    
    // ID를 문자열로 변환 
    plainEntity.id = String(plainEntity.id);
    
    // null 값 처리
    if (plainEntity.lastLoginAt === null) {
      plainEntity.lastLoginAt = undefined;
    }
    
    if (plainEntity.deletedAt === null) {
      plainEntity.deletedAt = undefined;
    }
    
    // 일반 객체를 도메인 객체로 변환
    return plainToInstance(User, plainEntity);
  }

  /**
   * UserEntity 배열을 User 도메인 객체 배열로 변환합니다.
   * @param entities 변환할 UserEntity 객체 배열
   * @returns User 도메인 객체 배열
   */
  toDomainList(entities: UserEntity[]): User[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * User 도메인 객체를 UserEntity로 변환합니다.
   * @param domain 변환할 User 도메인 객체
   * @returns UserEntity 객체
   */
  toEntity(domain: User): UserEntity {
    // 도메인 객체를 일반 객체로 변환
    const plainDomain = instanceToPlain(domain);
    
    // ID를 숫자로 변환
    if (plainDomain.id) {
      plainDomain.id = Number(plainDomain.id);
    }
    
    // undefined를 null로 변환 (데이터베이스 호환성)
    if (plainDomain.lastLoginAt === undefined) {
      plainDomain.lastLoginAt = null;
    }
    
    if (plainDomain.deletedAt === undefined) {
      plainDomain.deletedAt = null;
    }
    
    // 일반 객체를 엔티티로 변환
    return plainToInstance(UserEntity, plainDomain);
  }

  /**
   * User 도메인 객체 배열을 UserEntity 배열로 변환합니다.
   * @param domains 변환할 User 도메인 객체 배열
   * @returns UserEntity 배열
   */
  toEntityList(domains: User[]): UserEntity[] {
    return domains.map(domain => this.toEntity(domain));
  }

  /**
   * 부분 업데이트에 사용할 수 있는 특별한 매핑 메서드입니다.
   * 이 메서드는 기존 엔티티를 새 엔티티로 대체하지 않고 필요한 속성만 업데이트합니다.
   * @param domain 업데이트할 속성을 가진 부분적인 도메인 객체
   * @param entity 업데이트할 기존 엔티티
   * @returns 업데이트된 엔티티
   */
  updateEntity(domain: Partial<User>, entity: UserEntity): UserEntity {
    // 기본 속성들 업데이트
    if (domain.email !== undefined) entity.email = domain.email;
    if (domain.phoneNumber !== undefined) entity.phoneNumber = domain.phoneNumber;
    if (domain.passwordHash !== undefined) entity.passwordHash = domain.passwordHash;
    if (domain.role !== undefined) entity.role = domain.role;
    if (domain.status !== undefined) entity.status = domain.status;
    if (domain.loginFailCount !== undefined) entity.loginFailCount = domain.loginFailCount;
    if (domain.lastLoginAt !== undefined) entity.lastLoginAt = domain.lastLoginAt || null;
    
    return entity;
  }
}
