import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

import {
  AuthVerificationEntity,
  IdentityProviderEntity,
  OAuthProviderEntity,
  PhoneVerificationEntity,
  SessionLogEntity,
  TermsEntity,
  UserOAuthAccountEntity,
} from "@/modules/auth/infrastructure/adapter/out/persistence/entities"
import { TermsAgreementEntity } from "@/modules/auth/infrastructure/adapter/out/persistence/entities/terms-agreement.entity"
// 모든 엔티티 import
import { BaekjoonProfileEntity } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/typeorm/entities"
import { MailAuditEntity } from "@/modules/mail/infrastructure/adapter/out/persistence/entities/mail-audit.entity"
import {
  MentorProfileEntity,
  MentorProfileTagEntity,
  MentorTagEntity,
} from "@/modules/mentor/infrastructure/adapter/out/persistence/entities"
import { UserEntity, UserProfileEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities"

/**
 * 도메인별 엔티티 그룹
 */
export const USER_ENTITIES: EntityClassOrSchema[] = [UserEntity, UserProfileEntity]
export const AUTH_ENTITIES: EntityClassOrSchema[] = [
  AuthVerificationEntity,
  SessionLogEntity,
  OAuthProviderEntity,
  UserOAuthAccountEntity,
  IdentityProviderEntity,
  PhoneVerificationEntity,
  TermsEntity,
  TermsAgreementEntity,
]
export const BAEKJOON_ENTITIES: EntityClassOrSchema[] = [BaekjoonProfileEntity]
export const MAIL_ENTITIES: EntityClassOrSchema[] = [MailAuditEntity]
export const MENTOR_PROFILES_ENTITIES: EntityClassOrSchema[] = [
  MentorProfileEntity,
  MentorTagEntity,
  MentorProfileTagEntity,
]

/**
 * 모든 TypeORM 엔티티 중앙 관리
 * 새로운 엔티티 추가시 해당 도메인 배열에 추가하면 됨
 */
export const ALL_ENTITIES: EntityClassOrSchema[] = [
  // BaseEntity,
  ...USER_ENTITIES,
  ...AUTH_ENTITIES,
  ...BAEKJOON_ENTITIES,
  ...MAIL_ENTITIES,
  ...MENTOR_PROFILES_ENTITIES,
] as const

/**
 * 엔티티 타입 검증을 위한 타입 정의
 */
export type RegisteredEntity = (typeof ALL_ENTITIES)[number]
