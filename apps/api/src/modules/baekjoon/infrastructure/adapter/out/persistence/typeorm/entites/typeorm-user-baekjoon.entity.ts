import { UserEntity } from "@/modules/user/infrastructure/adapter/out/persistence/entities"
import { booleanTransformer } from "@/shared/utils/database.util"
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("user_baekjoon")
export class UserBaekjoon {
  @PrimaryGeneratedColumn()
  idx: number

  // UserEntity를 참조 (의존적 관계)
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  user: UserEntity

  @Column({ name: "baekjoon_id", length: 50, unique: true })
  baekjoonId: string

  @Column({
    name: "is_mentor_eligible",
    type: "number",
    precision: 1,
    default: 0,
    transformer: booleanTransformer,
  })
  isMentorEligible: boolean

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt: Date | null

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date
}
