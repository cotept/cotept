import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"

import { MentorProfileTagEntity } from "./mentor-profile-tag.entity"

import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities/user.entity"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"
import { booleanTransformer } from "@/shared/utils/database.util"

/**
 * MentorProfile 엔티티
 * MENTOR_PROFILES 테이블에 매핑되는 TypeORM 엔티티
 * 멘토의 상세 프로필 정보를 저장
 */
@Entity("MENTOR_PROFILES")
export class MentorProfileEntity extends BaseEntity<MentorProfileEntity> {
  // User와의 1:1 관계 - user_id로 User.idx에 연결
  @OneToOne(() => UserEntity, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id", referencedColumnName: "idx" })
  user: UserEntity

  // NoSQL 연계를 위한 명시적 userId 필드 (BaekjoonProfile 패턴과 동일)
  @Column({ name: "cotept_user_id", type: "varchar2", length: 36 })
  userId: string

  // 멘토링 소개 제목
  @Column({ name: "introduction_title", type: "varchar2", length: 100, nullable: true })
  introductionTitle?: string

  // 멘토링 소개 내용 (마크다운 형식)
  @Column({ name: "introduction_content", type: "clob", nullable: true })
  introductionContent?: string

  // 백준 티어 표시 여부
  @Column({ name: "baekjoon_tier_display", type: "number", transformer: booleanTransformer, default: 1 })
  baekjoonTierDisplay: number

  // 멘토링 통계
  @Column({ name: "mentoring_count", type: "number", default: 0 })
  mentoringCount: number

  @Column({ name: "total_review_count", type: "number", default: 0 })
  totalReviewCount: number

  @Column({ name: "average_rating", type: "number", precision: 3, scale: 2, default: 0.0 })
  averageRating: number

  // 멘토 상태
  @Column({ name: "is_verified", type: "number", transformer: booleanTransformer, default: 0 })
  isVerified: number

  @Column({ name: "is_active", type: "number", transformer: booleanTransformer, default: 1 })
  isActive: number

  // 프로필 완성도 (0-100%)
  @Column({ name: "profile_completion", type: "number", default: 0 })
  profileCompletion: number

  // MentorProfileTag와의 1:N 관계
  @OneToMany(() => MentorProfileTagEntity, (profileTag) => profileTag.mentorProfile, {
    cascade: true,
  })
  mentorProfileTags?: MentorProfileTagEntity[]
}
