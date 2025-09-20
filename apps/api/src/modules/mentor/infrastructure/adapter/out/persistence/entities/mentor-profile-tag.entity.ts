import { Entity, JoinColumn, ManyToOne } from "typeorm"

import { MentorProfileEntity } from "./mentor-profile.entity"
import { MentorTagEntity } from "./mentor-tag.entity"

import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

/**
 * MentorProfileTag 엔티티
 * MENTOR_PROFILE_TAGS 테이블에 매핑되는 TypeORM 엔티티
 * 멘토 프로필과 태그의 다대다 관계를 관리하는 중간 테이블
 */
@Entity("MENTOR_PROFILE_TAGS")
export class MentorProfileTagEntity extends BaseEntity<MentorProfileTagEntity> {
  // MentorProfile과의 N:1 관계
  @ManyToOne(() => MentorProfileEntity, (mentorProfile) => mentorProfile.mentorProfileTags, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mentor_profile_id", referencedColumnName: "idx" })
  mentorProfile: MentorProfileEntity

  // MentorTag와의 N:1 관계
  @ManyToOne(() => MentorTagEntity, (mentorTag) => mentorTag.mentorProfileTags, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mentor_tag_id", referencedColumnName: "idx" })
  mentorTag: MentorTagEntity
}