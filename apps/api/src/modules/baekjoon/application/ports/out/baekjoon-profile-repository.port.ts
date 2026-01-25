import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { BaekjoonProfileVerificationStatusType } from "@/modules/baekjoon/domain/vo/baekjoon-profile-verification-status.vo"

/**
 * 백준 레포지토리 포트
 * 백준 관련 데이터 영속성을 담당하는 아웃바운드 포트
 */
export abstract class BaekjoonProfileRepositoryPort {
  /**
   * 백준 사용자 정보를 저장합니다
   */
  abstract save(baekjoonUser: BaekjoonUser): Promise<BaekjoonUser>

  /**
   * 사용자 ID로 백준 사용자를 조회합니다
   */
  abstract findByUserId(userId: string): Promise<BaekjoonUser | null>

  /**
   * 핸들로 백준 사용자를 조회합니다
   */
  abstract findByBaekjoonId(baekjoonId: string): Promise<BaekjoonUser | null>

  abstract update(userId: string, baekjoonUser: BaekjoonUser): Promise<BaekjoonUser>

  abstract exists(userId: string): Promise<boolean>

  abstract delete(userId: string): Promise<void>

  // === 인증 상태 관리 ===
  abstract updateVerificationStatus(userId: string, status: BaekjoonProfileVerificationStatusType): Promise<void>
  abstract findPendingVerificationUsers(limit?: number): Promise<BaekjoonUser[]>
  abstract findVerifiedUsers(limit?: number): Promise<BaekjoonUser[]>

  // === 멘토 자격 관리 ===
  abstract findMentorEligibleUsers(limit?: number): Promise<BaekjoonUser[]>
  abstract countMentorEligibleUsers(): Promise<number>
}
