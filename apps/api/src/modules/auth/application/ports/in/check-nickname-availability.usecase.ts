import { CheckNicknameAvailabilityDto, AvailabilityResultDto } from '@/modules/auth/application/dtos'

/**
 * 닉네임 중복 확인 유스케이스 인터페이스
 */
export abstract class CheckNicknameAvailabilityUseCase {
  /**
   * 닉네임 중복을 확인합니다
   * @param dto 닉네임 중복 확인 정보
   * @returns 중복 확인 결과
   */
  abstract execute(dto: CheckNicknameAvailabilityDto): Promise<AvailabilityResultDto>
}