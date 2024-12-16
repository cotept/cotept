import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm"

/**
 * 전화번호 인증 코드 관리를 위한 엔티티
 * 사용자 본인 확인 및 보안 감사를 위한 정보를 저장합니다.
 */
@Entity("verification_codes")
export class VerificationCode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  /** 인증 대상 전화번호 */
  @Index()
  @Column({ length: 20 })
  phone: string

  /** 발송된 인증 코드 */
  @Column({ length: 6 })
  code: string

  /** 인증 시도 횟수 */
  @Column({ default: 0 })
  attemptCount: number

  /** 인증 완료 여부 */
  @Column({ default: false })
  verified: boolean

  /** 인증 코드 무효화 여부 (재사용 방지) */
  @Column({ default: false })
  invalidated: boolean

  /** 인증 코드 만료 시점 */
  @Column()
  expiresAt: Date

  /** 인증 코드 생성 시점 */
  @CreateDateColumn()
  createdAt: Date

  /** 인증 완료 시점 */
  @Column({ nullable: true })
  verifiedAt?: Date

  /** 인증 요청 IP 주소 (보안 추적) */
  @Column({ length: 45, nullable: true })
  ipAddress?: string

  /** 인증 요청 기기 식별자 (세션 추적) */
  @Column({ length: 100, nullable: true })
  deviceId?: string

  /** 연관된 사용자 ID (감사 추적) */
  @Index()
  @Column({ nullable: true })
  userId?: string
}
