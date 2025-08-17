import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"

import {
  BaekjoonProfileVerificationStatus,
  BaekjoonProfileVerificationStatusType,
} from "@/modules/baekjoon/domain/vo/baekjoon-profile-verification-status.vo"
import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities"
import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"
import { booleanTransformer } from "@/shared/utils/database.util"

// UserBaekjoonProfile 엔티티 (수정된 버전)
@Entity("BAEKJOON_PROFILE")
export class BaekjoonProfileEntity extends BaseEntity<BaekjoonProfileEntity> {
  @PrimaryGeneratedColumn("uuid")
  id: string
  
  @Column({ name: "idx", type: "number", nullable: true })
  idx?: number

  @OneToOne(() => UserEntity, (user) => user.baekjoonProfile)
  @JoinColumn({ name: "user_id" })
  user: UserEntity

  @Column({ name: "user_id", type: "varchar2", length: 36 })
  userId: string // NoSQL 연계를 위한 명시적 필드

  @Column({ name: "baekjoon_id", length: 50, unique: true })
  baekjoonId: string // NoSQL 연계를 위한 키

  @Column({ name: "current_tier", length: 20, nullable: true })
  currentTier?: string

  @Column({ name: "highest_tier", length: 20, nullable: true })
  highestTier?: string

  @Column({
    name: "verification_status",
    type: "varchar2",
    length: 20,
    default: BaekjoonProfileVerificationStatus.PENDING,
  })
  verificationStatus: BaekjoonProfileVerificationStatusType

  @Column({
    name: "is_mentor_eligible",
    type: "number",
    precision: 1,
    default: 0,
    transformer: booleanTransformer,
  })
  isMentorEligible: boolean

  @Column({ name: "last_synced_at", type: "timestamp", nullable: true })
  lastSyncedAt?: Date
}
