import { BojTag } from "@/modules/baekjoon/infrastructure/adapter/out/persistence/nosql/schemas"

/**
 * 백준 통계 레포지토리 포트 (NoSQL)
 * 사용자 문제 풀이 데이터, 태그 통계, 성능 데이터 등을 관리
 */
export abstract class BaekjoonStatisticsRepositoryPort {
  // === 문제 풀이 태그 통계 ===
  /**
   * solved.ac 태그 API 응답을 그대로 저장
   */
  abstract saveTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void>

  /**
   * userId로 BojTag[] 반환
   */
  abstract findTagStatisticsByUserId(userId: string): Promise<BojTag[] | null>

  /**
   * handle로 BojTag[] 반환
   */
  abstract findTagStatisticsByHandle(handle: string): Promise<BojTag[] | null>

  /**
   * updateTagStatistics
   */
  abstract updateTagStatistics(userId: string, handle: string, tags: BojTag[]): Promise<void>

  /**
   * deleteTagStatistics
   */
  abstract deleteTagStatistics(userId: string, handle: string): Promise<void>
}
