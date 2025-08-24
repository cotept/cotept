import { Injectable } from "@nestjs/common"

import { instanceToPlain, plainToInstance } from "class-transformer"

import { AuthType, AuthVerification } from "@/modules/auth/domain/model/auth-verification"
import { AuthVerificationEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/auth-verification.entity"

/**
 * 인증 검증 영속성 매퍼
 * 도메인 모델과 영속성 엔티티 간의 변환을 담당
 */
@Injectable()
export class AuthVerificationPersistenceMapper {
  /**
   * 도메인 엔티티 -> 영속성 엔티티 변환
   * @param authVerification 인증 검증 도메인 엔티티
   * @returns 인증 검증 영속성 엔티티
   */
  toEntity(authVerification: AuthVerification): AuthVerificationEntity {
    const plainData = {
      idx: authVerification.idx,
      userId: authVerification.userId,
      authType: authVerification.authType,
      target: authVerification.target,
      verificationCode: authVerification.verificationCode,
      expiresAt: authVerification.expiresAt,
      verified: authVerification.verified ? 1 : 0,
      verifiedAt: authVerification.verifiedAt,
      attemptCount: authVerification.attemptCount,
      ipAddress: authVerification.ipAddress,
      createdAt: authVerification.createdAt,
    }

    return plainToInstance(AuthVerificationEntity, plainData)
  }

  /**
   * 영속성 엔티티 -> 도메인 엔티티 변환
   * @param entity 인증 검증 영속성 엔티티
   * @returns 인증 검증 도메인 엔티티
   */
  toDomain(entity: AuthVerificationEntity): AuthVerification {
    const plainData = instanceToPlain(entity)

    return new AuthVerification(
      plainData.idx,
      plainData.userId,
      plainData.authType as AuthType,
      plainData.target,
      plainData.verificationCode,
      plainData.expiresAt,
      plainData.verified === 1,
      plainData.verifiedAt,
      plainData.attemptCount,
      plainData.ipAddress,
      plainData.createdAt,
    )
  }

  /**
   * 영속성 엔티티 목록 -> 도메인 엔티티 목록 변환
   * @param entities 인증 검증 영속성 엔티티 목록
   * @returns 인증 검증 도메인 엔티티 목록
   */
  toDomainList(entities: AuthVerificationEntity[]): AuthVerification[] {
    return entities.map((entity) => this.toDomain(entity))
  }

  /**
   * 도메인 엔티티 목록 -> 영속성 엔티티 목록 변환
   * @param authVerifications 인증 검증 도메인 엔티티 목록
   * @returns 인증 검증 영속성 엔티티 목록
   */
  toEntityList(authVerifications: AuthVerification[]): AuthVerificationEntity[] {
    return authVerifications.map((authVerification) => this.toEntity(authVerification))
  }
}
