import { CheckUserIdAvailabilityDto, AvailabilityResultDto } from '@/modules/auth/application/dtos'

/**
 * 사용자 ID 중복 확인 유스케이스 인터페이스
 */
export abstract class CheckUserIdAvailabilityUseCase {
  /**
   * 사용자 ID 중복을 확인합니다
   * @param dto 사용자 ID 중복 확인 정보
   * @returns 중복 확인 결과
   */
  abstract execute(dto: CheckUserIdAvailabilityDto): Promise<AvailabilityResultDto>
}