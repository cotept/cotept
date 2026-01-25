import { Injectable } from "@nestjs/common"

import { instanceToPlain, plainToInstance } from "class-transformer"

import { LoginSession } from "@/modules/auth/domain/model/login-session"
import { SessionLogEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/session-log.entity"

/**
 * 로그인 세션 영속성 매퍼
 * 도메인 모델과 영속성 엔티티 간의 변환을 담당
 */
@Injectable()
export class LoginSessionPersistenceMapper {
  /**
   * 도메인 엔티티 -> 영속성 엔티티 변환
   * @param loginSession 로그인 세션 도메인 엔티티
   * @returns 세션 로그 영속성 엔티티
   */
  toEntity(loginSession: LoginSession): SessionLogEntity {
    const plainData = {
      idx: loginSession.idx,
      userIdx: loginSession.userId,
      token: loginSession.token,
      ipAddress: loginSession.ipAddress,
      userAgent: loginSession.userAgent,
      expiresAt: loginSession.expiresAt,
      createdAt: loginSession.createdAt,
      endedAt: loginSession.endedAt,
      endReason: loginSession.endReason,
    }

    return plainToInstance(SessionLogEntity, plainData)
  }

  /**
   * 영속성 엔티티 -> 도메인 엔티티 변환
   * @param entity 세션 로그 영속성 엔티티
   * @returns 로그인 세션 도메인 엔티티
   */
  toDomain(entity: SessionLogEntity): LoginSession {
    const plainData = instanceToPlain(entity)

    return new LoginSession(
      plainData.idx,
      plainData.userId,
      plainData.token,
      plainData.ipAddress || "",
      plainData.userAgent || "",
      plainData.expiresAt,
      plainData.createdAt,
      plainData.endedAt,
      plainData.endReason,
    )
  }

  /**
   * 영속성 엔티티 목록 -> 도메인 엔티티 목록 변환
   * @param entities 세션 로그 영속성 엔티티 목록
   * @returns 로그인 세션 도메인 엔티티 목록
   */
  toDomainList(entities: SessionLogEntity[]): LoginSession[] {
    return entities.map((entity) => this.toDomain(entity))
  }

  /**
   * 도메인 엔티티 목록 -> 영속성 엔티티 목록 변환
   * @param loginSessions 로그인 세션 도메인 엔티티 목록
   * @returns 세션 로그 영속성 엔티티 목록
   */
  toEntityList(loginSessions: LoginSession[]): SessionLogEntity[] {
    return loginSessions.map((loginSession) => this.toEntity(loginSession))
  }
}
