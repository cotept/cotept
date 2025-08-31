import { CheckEmailAvailabilityDto, AvailabilityResultDto } from '@/modules/auth/application/dtos'

/**
 * 이메일 중복 확인 유스케이스 인터페이스
 */
export abstract class CheckEmailAvailabilityUseCase {
  /**
   * 이메일 중복을 확인합니다
   * @param dto 이메일 중복 확인 정보
   * @returns 중복 확인 결과
   */
  abstract execute(dto: CheckEmailAvailabilityDto): Promise<AvailabilityResultDto>
}