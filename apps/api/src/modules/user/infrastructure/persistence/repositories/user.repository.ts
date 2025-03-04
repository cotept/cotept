// apps/api/src/modules/user/infrastructure/persistence/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { BaseRepository } from '../../../../../shared/infrastructure/persistence/typeorm/repositories/base/base.repository';
import { UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { User, UserStatus } from '../../../domain/user';

/**
 * User 도메인의 저장소 구현
 * BaseRepository를 상속받아 기본 CRUD 기능을 확장하고, User 도메인에 특화된 메서드를 추가합니다.
 */
@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
    entityManager: EntityManager,
    private readonly userMapper: UserMapper
  ) {
    super(userRepository, entityManager, 'User');
  }

  /**
   * 이메일로 사용자를 찾습니다.
   * @param email 찾을 사용자의 이메일
   * @returns 찾은 사용자의 도메인 객체 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Finding user by email: ${email}`);
      const entity = await this.entityRepository.findOne({
        where: { email } as any,
      });
      
      if (!entity) {
        this.logger.debug(`[${this.serviceName}] User not found with email: ${email}`);
        return null;
      }
      
      // 매퍼를 사용해 도메인 객체로 변환
      return this.userMapper.toDomain(entity);
    });
  }
  
  /**
   * 새 사용자를 생성합니다.
   * @param user 생성할 사용자 도메인 객체
   * @returns 생성된 사용자 도메인 객체
   */
  async createUser(user: User): Promise<User> {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Creating new user with email: ${user.email}`);
      
      // 도메인 객체를 엔티티로 변환
      const entity = this.userMapper.toEntity(user);
      
      // 저장
      const savedEntity = await this.entityRepository.save(entity);
      
      this.logger.debug(`[${this.serviceName}] User created successfully with ID: ${savedEntity.id}`);
      
      // 도메인 객체로 변환하여 반환
      return this.userMapper.toDomain(savedEntity);
    });
  }

  /**
   * 사용자 상태를 업데이트합니다.
   * @param userId 업데이트할 사용자 ID
   * @param status 새 상태
   * @returns 업데이트된 사용자 도메인 객체
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    return this.executeOperation(async () => {
      this.logger.debug(`[${this.serviceName}] Updating user status: ID=${userId}, status=${status}`);
      
      // 사용자 찾기
      const entity = await this.entityRepository.findOne({
        where: { id: Number(userId) } as any,
      });
      
      if (!entity) {
        this.logger.warn(`[${this.serviceName}] User not found for status update: ${userId}`);
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      // 부분 업데이트 - 매퍼의 updateEntity 사용
      const updatedEntity = this.userMapper.updateEntity({ status }, entity);
      
      // 저장
      const savedEntity = await this.entityRepository.save(updatedEntity);
      
      this.logger.debug(`[${this.serviceName}] User status updated successfully`);
      
      // 도메인 객체로 변환하여 반환
      return this.userMapper.toDomain(savedEntity);
    });
  }

  /**
   * 로그인 시도 실패 카운트를 증가시킵니다.
   * @param userId 사용자 ID
   * @returns 업데이트된 사용자 도메인 객체
   */
  async incrementLoginFailCount(userId: string): Promise<User> {
    return this.executeOperation(async () => {
      const entity = await this.entityRepository.findOne({
        where: { id: Number(userId) } as any,
      });
      
      if (!entity) {
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      // 실패 카운트 증가
      entity.loginFailCount += 1;
      
      // 저장
      const savedEntity = await this.entityRepository.save(entity);
      
      // 도메인 객체로 변환하여 반환
      return this.userMapper.toDomain(savedEntity);
    });
  }

  /**
   * 마지막 로그인 시간을 업데이트하고 실패 카운트를 초기화합니다.
   * @param userId 사용자 ID
   * @returns 업데이트된 사용자 도메인 객체
   */
  async updateLastLogin(userId: string): Promise<User> {
    return this.executeOperation(async () => {
      const entity = await this.entityRepository.findOne({
        where: { id: Number(userId) } as any,
      });
      
      if (!entity) {
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      // 마지막 로그인 시간 업데이트, 실패 카운트 초기화
      entity.lastLoginAt = new Date();
      entity.loginFailCount = 0;
      
      // 저장
      const savedEntity = await this.entityRepository.save(entity);
      
      // 도메인 객체로 변환하여 반환
      return this.userMapper.toDomain(savedEntity);
    });
  }

  /**
   * 여러 조건으로 사용자 검색 (관리자용)
   * @param criteria 검색 조건
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @returns 페이징된 사용자 목록
   */
  async findUsersByCriteria(
    criteria: { status?: UserStatus; role?: string; email?: string },
    page = 1,
    limit = 10
  ) {
    return this.executeOperation(async () => {
      const queryBuilder = this.entityRepository.createQueryBuilder('user');
      
      // 검색 조건 적용
      if (criteria.status) {
        queryBuilder.andWhere('user.status = :status', { status: criteria.status });
      }
      
      if (criteria.role) {
        queryBuilder.andWhere('user.role = :role', { role: criteria.role });
      }
      
      if (criteria.email) {
        queryBuilder.andWhere('user.email LIKE :email', { email: `%${criteria.email}%` });
      }
      
      // 페이징 적용
      const [entities, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      
      // 도메인 객체로 변환
      const users = this.userMapper.toDomainList(entities);
      
      return {
        items: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    });
  }
}
