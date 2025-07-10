import { GetStatisticsInputDto, TagStatisticsOutputDto } from "@/modules/baekjoon/application/dtos"

/**
 * 통계 조회 유스케이스 포트
 * 백준 사용자의 태그별 통계를 조회하는 인바운드 포트
 */
export abstract class GetStatisticsUseCase {
  /**
   * 백준 사용자의 태그별 통계를 조회합니다
   */
  abstract execute(inputDto: GetStatisticsInputDto): Promise<TagStatisticsOutputDto>

  /**
   * 백준 ID로 통계를 조회합니다 (공개 조회)
   */
  abstract executeByHandle(handle: string): Promise<TagStatisticsOutputDto>
}
