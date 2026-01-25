import { Column, Entity, JoinColumn, OneToOne } from "typeorm"

import { UserEntity } from "../../../../../../user/infrastructure/adapter/out/persistence/entities/user.entity"

import { BaseEntity } from "@/shared/infrastructure/persistence/base/base.entity"

/**
 * UserProfile 엔티티
 * USER_PROFILES 테이블에 매핑되는 TypeORM 엔티티
 * User 엔티티의 확장 프로필 정보를 저장
 */
@Entity("USER_PROFILES")
export class UserProfileEntity extends BaseEntity<UserProfileEntity> {
  // User와의 1:1 관계 - user_id로 User.idx에 연결
  @OneToOne(() => UserEntity, (user) => user.userProfile, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id", referencedColumnName: "idx" })
  user: UserEntity

  // NoSQL 연계를 위한 명시적 userId 필드 (BaekjoonProfile 패턴과 동일)
  @Column({ name: "cotept_user_id", type: "varchar2", length: 36 })
  userId: string

  // 필수 필드 - 회원가입 ProfileStep에서 수집
  @Column({ name: "nickname", type: "varchar2", length: 50 })
  nickname: string

  // 선택 필드들
  @Column({ name: "full_name", type: "varchar2", length: 100, nullable: true })
  fullName?: string

  @Column({ name: "introduce", type: "varchar2", length: 280, nullable: true })
  introduce?: string // 트위터 스타일 소개글 (280자 제한)

  @Column({ name: "profile_image_url", type: "varchar2", length: 1000, nullable: true })
  profileImageUrl?: string
}
