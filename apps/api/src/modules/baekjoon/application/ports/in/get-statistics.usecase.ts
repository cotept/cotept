import { TagStatisticsDto } from "@/modules/baekjoon/application/dtos"
import { GetTagStatisticsRequestDto } from "@/modules/baekjoon/infrastructure/dtos/request"

/**
 * 통계 조회 유스케이스 포트
 * 백준 사용자의 태그별 통계를 조회하는 인바운드 포트
 */
export abstract class GetStatisticsUseCase {
  /**
   * 백준 사용자의 태그별 통계를 조회합니다
   */
  abstract execute(requestDto: GetTagStatisticsRequestDto): Promise<TagStatisticsDto>
}
