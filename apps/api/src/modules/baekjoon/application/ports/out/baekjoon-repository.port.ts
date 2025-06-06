import { BaekjoonUser } from "@/modules/baekjoon/domain/model"
import { TagStatisticsDto } from "../../dtos"

/**
 * 백준 레포지토리 포트
 * 백준 관련 데이터 영속성을 담당하는 아웃바운드 포트
 */
export abstract class BaekjoonRepositoryPort {
  /**
   * 백준 사용자 정보를 저장합니다
   */
  abstract saveBaekjoonUser(user: BaekjoonUser): Promise<void>

  abstract updateBaekjoonUser(user: Partial<BaekjoonUser>): Promise<BaekjoonUser>

  /**
   * 핸들로 백준 사용자를 조회합니다
   */
  abstract findBaekjoonUserByHandle(handle: string): Promise<BaekjoonUser | null>

  /**
   * 사용자 ID로 백준 사용자를 조회합니다
   */
  abstract findBaekjoonUserByUserId(userId: string): Promise<BaekjoonUser | null>

  /**
   * 사용자 ID로 백준 사용자를 조회합니다
   */
  abstract findTagStatisticsResultByUserId(userId: string): Promise<TagStatisticsDto | null>

  /**
   * 사용자의 백준 ID로 백준 사용자를 조회합니다
   */
  abstract findTagStatisticsResultByHandle(userId: string): Promise<TagStatisticsDto | null>

  /**
   * 사용자의 백준 태그 통계 데이터를 저장합니다
   */
  abstract saveTagStatisticsResult(tagStatisticsResult: TagStatisticsDto): Promise<void>

  // /**
  //  * 인증 세션을 저장합니다
  //  */
  // abstract saveVerificationSession(session: VerificationSession): Promise<void>

  // /**
  //  * 세션 ID로 인증 세션을 조회합니다
  //  */
  // abstract findVerificationSessionById(sessionId: string): Promise<VerificationSession | null>

  // /**
  //  * 사용자 ID로 활성 인증 세션을 조회합니다
  //  */
  // abstract findActiveVerificationSessionByUserId(userId: string): Promise<VerificationSession | null>

  // /**
  //  * 만료된 인증 세션들을 삭제합니다
  //  */
  // abstract deleteExpiredVerificationSessions(): Promise<number>
}
