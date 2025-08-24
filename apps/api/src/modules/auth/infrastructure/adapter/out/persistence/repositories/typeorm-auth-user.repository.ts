import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { EntityManager, Repository } from "typeorm"
import { v4 as uuidv4 } from "uuid"

import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { SocialProvider } from "@/modules/auth/domain/model"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"
import {
  OAuthProviderEntity,
  UserOAuthAccountEntity,
} from "@/modules/auth/infrastructure/adapter/out/persistence/entities"
import { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseRepository } from "@/shared/infrastructure/persistence/typeorm/repositories/base/base.repository"
import { ErrorUtils } from "@/shared/utils/error.util"

/**
 * TypeORM을 사용한 인증용 사용자 레포지토리 구현
 */
@Injectable()
export class TypeOrmAuthUserRepository extends BaseRepository<UserEntity> implements AuthUserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
    entityManager: EntityManager,
    @InjectRepository(UserOAuthAccountEntity)
    private readonly oauthAccountRepository: Repository<UserOAuthAccountEntity>,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<OAuthProviderEntity>,
  ) {
    super(userRepository, entityManager, "AuthUser")
  }

  /**
   * 이메일로 사용자 찾기
   * @param email 사용자 이메일
   * @returns 인증용 사용자 또는 null
   */
  async findByEmail(email: string): Promise<AuthUser | null> {
    try {
      const userEntity = await this.entityRepository.findOne({
        where: { email },
        select: ["idx", "email", "passwordHash", "salt", "role", "status"],
      })

      if (!userEntity) return null

      return this.mapToAuthUser(userEntity)
    } catch (error) {
      this.handleDBError(error, "[AuthUser]")
    }
  }

  /**
   * ID로 사용자 찾기
   * @param id 사용자 ID
   * @returns 인증용 사용자 또는 null
   */
  async findById(userId: number): Promise<AuthUser | null> {
    try {
      const userEntity = await this.entityRepository.findOne({
        where: { idx: userId },
        select: [
          "idx",
          "userId",
          "email",
          "passwordHash",
          "salt",
          "role",
          "status",
          "createdAt",
          "updatedAt",
          "lastLoginAt",
        ],
      })

      if (!userEntity) return null

      return this.mapToAuthUser(userEntity)
    } catch (error) {
      this.handleDBError(error, "[AuthUser]")
    }
  }

  /**
   * 소셜 ID로 사용자 찾기
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @returns 인증용 사용자 또는 null
   */
  async findBySocialId(provider: SocialProvider, socialId: string): Promise<AuthUser | null> {
    try {
      // 1. 소셜 제공자 ID 조회
      const providerEntity = await this.oauthProviderRepository.findOne({
        where: { name: provider },
      })

      if (!providerEntity) {
        return null
      }

      // 2. 사용자 OAuth 계정 정보 조회
      const oauthAccount = await this.oauthAccountRepository.findOne({
        where: {
          providerId: providerEntity.idx,
          providerUserId: socialId,
        },
        relations: ["user"],
      })

      if (!oauthAccount || !oauthAccount.user) {
        return null
      }

      // 3. 연결된 사용자 엔티티 조회
      const userEntity = await this.entityRepository.findOne({
        where: { idx: oauthAccount.userId },
        select: ["idx", "email", "passwordHash", "salt", "role", "status"],
      })

      if (!userEntity) {
        return null
      }

      return this.mapToAuthUser(userEntity)
    } catch (error) {
      console.error(`Error finding user by social ID: ${error}`)
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new InternalServerErrorException("소셜 계정 찾을 수 없습니다.")
    }
  }

  /**
   * 기존 사용자에게 소셜 계정 연결
   * @param userId 사용자 ID
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   * @param profileData 프로필 데이터
   * @returns 성공 여부
   */
  async connectSocialAccount(
    userId: number,
    provider: SocialProvider,
    socialId: string,
    accessToken?: string,
    refreshToken?: string,
    profileData?: any,
  ): Promise<boolean> {
    try {
      // 1. 사용자 존재 여부 확인
      try {
        await this.findOne({ idx: userId })
      } catch {
        throw new NotFoundException("사용자를 찾을 수 없습니다.")
      }

      // 2. 소셜 제공자 정보 조회
      const providerEntity = await this.oauthProviderRepository.findOne({
        where: { name: provider },
      })

      if (!providerEntity) {
        throw new NotFoundException("지원하지 않는 소셜 로그인 제공자입니다.")
      }

      // 3. 이미 연결된 계정인지 확인
      const existingAccount = await this.oauthAccountRepository.findOne({
        where: {
          providerId: providerEntity.idx,
          providerUserId: socialId,
        },
      })

      if (existingAccount) {
        if (existingAccount.userId !== userId) {
          throw new ConflictException("이미 다른 사용자와 연결된 소셜 계정입니다.")
        }
        // 이미 이 사용자와 연결되어 있으면 업데이트
        existingAccount.accessToken = accessToken || null
        existingAccount.refreshToken = refreshToken || null
        existingAccount.profileData = profileData ? JSON.stringify(profileData) : null
        existingAccount.updatedAt = new Date()

        await this.oauthAccountRepository.save(existingAccount)
        return true
      }

      // 4. 새 소셜 계정 연결 정보 생성
      const newOAuthAccount = new UserOAuthAccountEntity()
      newOAuthAccount.userId = userId
      newOAuthAccount.providerId = providerEntity.idx
      newOAuthAccount.providerUserId = socialId
      newOAuthAccount.accessToken = accessToken || null
      newOAuthAccount.refreshToken = refreshToken || null
      newOAuthAccount.profileData = profileData ? JSON.stringify(profileData) : null
      newOAuthAccount.createdAt = new Date()

      await this.oauthAccountRepository.save(newOAuthAccount)
      return true
    } catch (error) {
      console.error(`Error connecting social account: ${error}`)
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new InternalServerErrorException("소셜 계정 연결 중 오류가 발생했습니다.")
    }
  }

  /**
   * 소셜 계정으로 새 사용자 생성
   * @param email 이메일
   * @param name 이름
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   * @param profileImageUrl 프로필 이미지 URL
   * @param profileData 프로필 데이터
   * @returns 생성된 사용자
   */
  async createSocialUser(
    email: string,
    name: string,
    provider: SocialProvider,
    socialId: string,
    accessToken?: string,
    refreshToken?: string,
    profileImageUrl?: string,
    profileData?: any,
  ): Promise<AuthUser> {
    try {
      // 1. 소셜 제공자 정보 조회
      const providerEntity = await this.oauthProviderRepository.findOne({
        where: { name: provider },
      })

      if (!providerEntity) {
        throw new NotFoundException("지원하지 않는 소셜 로그인 제공자입니다.")
      }

      // 2. 이미 존재하는 이메일인지 확인
      const emailExists = await this.count({ email })
      if (emailExists > 0) {
        throw new ConflictException("이미 사용 중인 이메일입니다.")
      }

      // 3. 이미 연결된 소셜 계정인지 확인
      const existingAccount = await this.oauthAccountRepository.findOne({
        where: {
          providerId: providerEntity.idx,
          providerUserId: socialId,
        },
      })

      if (existingAccount) {
        throw new ConflictException("이미 연결된 소셜 계정입니다.")
      }

      // 4. 새 사용자 생성
      const newUser = new UserEntity({
        userId: uuidv4(),
        email,
        passwordHash: "", // 소셜 로그인만 사용하는 계정
        salt: "",
        name,
        role: UserRole.MENTEE, // 기본 역할
        status: UserStatus.ACTIVE,
      })

      const savedUser = await this.create(newUser)

      // 5. 소셜 계정 연결 정보 생성
      const newOAuthAccount = new UserOAuthAccountEntity()
      newOAuthAccount.userId = savedUser.idx
      newOAuthAccount.providerId = providerEntity.idx
      newOAuthAccount.providerUserId = socialId
      newOAuthAccount.accessToken = accessToken || null
      newOAuthAccount.refreshToken = refreshToken || null
      newOAuthAccount.profileData = profileData ? JSON.stringify(profileData) : null
      newOAuthAccount.createdAt = new Date()

      await this.oauthAccountRepository.save(newOAuthAccount)

      // 6. 인증용 사용자 객체 반환
      return this.mapToAuthUser(savedUser)
    } catch (error) {
      console.error(`Error creating social user: ${error}`)
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error
      }
      throw new InternalServerErrorException("소셜 계정 사용자 생성 중 오류가 발생했습니다.")
    }
  }

  /**
   * 사용자 비밀번호 업데이트
   * @param userId 사용자 ID
   * @param hashedPassword 해싱된 새 비밀번호
   * @returns 성공 여부
   */
  async updatePassword(userId: number, hashedPassword: { hash: string; salt: string }): Promise<boolean> {
    try {
      // 1. 사용자 존재 여부 확인 및 업데이트
      await this.findOneAndUpdate(
        { idx: userId },
        {
          passwordHash: hashedPassword.hash,
          salt: hashedPassword.salt,
        },
      )
      return true
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.handleDBError(error, "[AuthUser]")
    }
  }

  /**
   * 사용자 ID로 사용자 찾기 (로그인용)
   * @param userId 사용자 ID (문자열)
   * @returns 인증용 사용자 또는 null
   */
  async findByUserId(userId: string): Promise<AuthUser | null> {
    try {
      const userEntity = await this.entityRepository.findOne({
        where: { userId },
        select: ["idx", "userId", "email", "passwordHash", "salt", "role", "status"],
      })

      if (!userEntity) return null

      return this.mapToAuthUser(userEntity)
    } catch (error) {
      this.handleDBError(error, "[AuthUser]")
    }
  }

  /**
   * 전화번호로 사용자 찾기
   * @param phoneNumber 전화번호
   * @returns 인증용 사용자 또는 null
   */
  async findByPhoneNumber(phoneNumber: string): Promise<AuthUser | null> {
    try {
      const userEntity = await this.entityRepository.findOne({
        where: { phoneNumber },
        select: ["idx", "email", "passwordHash", "salt", "role", "status"],
      })

      if (!userEntity) return null

      return this.mapToAuthUser(userEntity)
    } catch (error) {
      this.logger.error(
        `전화번호로 사용자 찾기 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )

      return null
    }
  }

  /**
   * 사용자 엔티티를 AuthUser로 매핑
   * @param entity 사용자 엔티티
   * @returns AuthUser 객체
   */
  private mapToAuthUser(entity: UserEntity): AuthUser {
    return new AuthUser(entity.idx, entity.email, entity.passwordHash, entity.salt, entity.role, entity.status)
  }
}
