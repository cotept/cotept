import { CreateUserProfileRequestDto, UserProfileDto } from "../../dtos/user-profile.dto"

/**
 * 사용자 프로필 생성 유스케이스 인터페이스
 * 이 포트는 외부에서 새 사용자 프로필을 생성하는 기능을 정의합니다.
 */
export abstract class CreateUserProfileUseCase {
  /**
   * 새 사용자 프로필 생성
   * @param createDto 생성할 프로필 정보
   * @returns 생성된 프로필 정보 DTO
   */
  abstract execute(createDto: CreateUserProfileRequestDto): Promise<UserProfileDto>
}
