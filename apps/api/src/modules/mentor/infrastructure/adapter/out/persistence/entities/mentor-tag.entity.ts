import { Column, Entity, OneToMany } from "typeorm"

import { MentorProfileTagEntity } from "./mentor-profile-tag.entity"

import { MentorTagCategory } from "@/modules/mentor/domain/model/mentor-tag"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"
import { booleanTransformer } from "@/shared/utils/database.util"

/**
 * MentorTag 엔티티
 * MENTOR_TAGS 테이블에 매핑되는 TypeORM 엔티티
 * 멘토의 직무, 연차, 회사 정보를 저장하는 태그 마스터 데이터
 */
@Entity("MENTOR_TAGS")
export class MentorTagEntity extends BaseEntity<MentorTagEntity> {
  @Column({ name: "name", type: "varchar2", length: 50 })
  name: string

  @Column({
    name: "category",
    type: "varchar2",
    length: 20,
    comment: "job: 직무, experience: 연차, company: 회사",
  })
  category: MentorTagCategory

  @Column({ name: "display_order", type: "number", default: 0 })
  displayOrder: number

  @Column({ name: "is_active", type: "number", transformer: booleanTransformer, default: 1 })
  isActive: number

  // MentorProfileTag와의 1:N 관계
  @OneToMany(() => MentorProfileTagEntity, (profileTag) => profileTag.mentorTag)
  mentorProfileTags?: MentorProfileTagEntity[]
}
