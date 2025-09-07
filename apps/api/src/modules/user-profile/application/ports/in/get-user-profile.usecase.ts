import { UserProfileDto } from "../../dtos/user-profile.dto"

/**
 * 사용자 프로필 조회 유스케이스 인터페이스
 * 이 포트는 사용자 프로필을 조회하는 기능을 정의합니다.
 */
export abstract class GetUserProfileUseCase {
  /**
   * 사용자 ID로 프로필 조회
   * @param userId 사용자 ID
   * @returns 사용자 프로필 DTO 또는 null
   */
  abstract executeByUserId(userId: string): Promise<UserProfileDto | null>

  /**
   * 프로필 ID로 프로필 조회
   * @param idx 프로필 ID (기본키)
   * @returns 사용자 프로필 DTO 또는 null
   */
  abstract executeByIdx(idx: number): Promise<UserProfileDto | null>

  /**
   * 사용자 ID로 프로필 조회 (NotFound 예외 발생 버전)
   * @param userId 사용자 ID
   * @returns 사용자 프로필 DTO
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   */
  abstract executeByUserIdOrThrow(userId: string): Promise<UserProfileDto>

  /**
   * 프로필 ID로 프로필 조회 (NotFound 예외 발생 버전)
   * @param idx 프로필 ID (기본키)
   * @returns 사용자 프로필 DTO
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   */
  abstract executeByIdxOrThrow(idx: number): Promise<UserProfileDto>
}
