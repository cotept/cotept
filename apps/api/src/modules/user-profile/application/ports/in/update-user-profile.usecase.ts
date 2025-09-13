import { UpdateUserProfileRequestDto, UserProfileDto } from "../../dtos/user-profile.dto"

/**
 * 사용자 프로필 업데이트 유스케이스 인터페이스
 * 이 포트는 사용자 프로필을 업데이트하는 기능을 정의합니다.
 */
export abstract class UpdateUserProfileUseCase {
  /**
   * 사용자 프로필 업데이트
   * @param userId 업데이트할 사용자 ID
   * @param updateDto 업데이트할 정보
   * @returns 업데이트된 프로필 DTO
   */
  abstract execute(userId: string, updateDto: UpdateUserProfileRequestDto): Promise<UserProfileDto>
}
