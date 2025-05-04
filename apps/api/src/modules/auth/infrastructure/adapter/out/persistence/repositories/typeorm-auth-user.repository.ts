import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { SocialProvider } from "@/modules/auth/domain/model"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"
import {
  OAuthProviderEntity,
  UserOAuthAccountEntity,
} from "@/modules/auth/infrastructure/adapter/out/persistence/entities"
import { UserRole, UserStatus } from "@/modules/user/domain/model/user"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { v4 as uuidv4 } from "uuid"

/**
 * TypeORM을 사용한 인증용 사용자 레포지토리 구현
 */
@Injectable()
export class TypeOrmAuthUserRepository implements AuthUserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserOAuthAccountEntity)
    private readonly oauthAccountRepository: Repository<UserOAuthAccountEntity>,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<OAuthProviderEntity>,
  ) {}

  /**
   * 이메일로 사용자 찾기
   * @param email 사용자 이메일
   * @returns 인증용 사용자 또는 null
   */
  async findByEmail(email: string): Promise<AuthUser | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      select: ["id", "email", "passwordHash", "salt", "role", "status"],
    })

    if (!userEntity) return null

    return this.mapToAuthUser(userEntity)
  }

  /**
   * ID로 사용자 찾기
   * @param id 사용자 ID
   * @returns 인증용 사용자 또는 null
   */
  async findById(id: string): Promise<AuthUser | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      select: ["id", "email", "passwordHash", "salt", "role", "status"],
    })

    if (!userEntity) return null

    return this.mapToAuthUser(userEntity)
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
          providerId: providerEntity.id,
          providerUserId: socialId,
        },
        relations: ["user"],
      })

      if (!oauthAccount || !oauthAccount.user) {
        return null
      }

      // 3. 연결된 사용자 엔티티 조회
      const userEntity = await this.userRepository.findOne({
        where: { id: oauthAccount.userId },
        select: ["id", "email", "passwordHash", "salt", "role", "status"],
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
    userId: string,
    provider: SocialProvider,
    socialId: string,
    accessToken?: string,
    refreshToken?: string,
    profileData?: any,
  ): Promise<boolean> {
    try {
      // 1. 사용자 존재 여부 확인
      const user = await this.userRepository.findOne({
        where: { id: userId },
      })

      if (!user) {
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
          providerId: providerEntity.id,
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
      newOAuthAccount.id = uuidv4()
      newOAuthAccount.userId = userId
      newOAuthAccount.providerId = providerEntity.id
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
      const existingUser = await this.userRepository.findOne({
        where: { email },
      })

      if (existingUser) {
        throw new ConflictException("이미 사용 중인 이메일입니다.")
      }

      // 3. 이미 연결된 소셜 계정인지 확인
      const existingAccount = await this.oauthAccountRepository.findOne({
        where: {
          providerId: providerEntity.id,
          providerUserId: socialId,
        },
      })

      if (existingAccount) {
        throw new ConflictException("이미 연결된 소셜 계정입니다.")
      }

      // 4. 새 사용자 생성
      const newUser = new UserEntity()
      newUser.id = uuidv4()
      newUser.email = email
      newUser.passwordHash = "" // 소셜 로그인만 사용하는 계정
      newUser.salt = ""
      newUser.name = name
      newUser.role = UserRole.MENTEE // 기본 역할
      newUser.status = UserStatus.ACTIVE
      newUser.createdAt = new Date()

      const savedUser = await this.userRepository.save(newUser)

      // 5. 소셜 계정 연결 정보 생성
      const newOAuthAccount = new UserOAuthAccountEntity()
      newOAuthAccount.id = uuidv4()
      newOAuthAccount.userId = savedUser.id
      newOAuthAccount.providerId = providerEntity.id
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
   * 사용자 엔티티를 AuthUser로 매핑
   * @param entity 사용자 엔티티
   * @returns AuthUser 객체
   */
  private mapToAuthUser(entity: UserEntity): AuthUser {
    return new AuthUser(entity.id, entity.email, entity.passwordHash, entity.salt, entity.role, entity.status)
  }
}
