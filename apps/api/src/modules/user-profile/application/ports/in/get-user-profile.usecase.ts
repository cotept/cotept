import { UserProfileDto } from "../../dtos/user-profile.dto"

/**
 * 사용자 프로필 조회 유스케이스 인터페이스 (인바운드 포트)
 */
export abstract class GetUserProfileUseCase {
  /**
   * 사용자 ID(문자열)로 프로필 조회
   */
  abstract executeByUserId(userId: string): Promise<UserProfileDto | null>

  /**
   * 프로필 IDX(기본키)로 프로필 조회
   */
  abstract executeByIdx(idx: number): Promise<UserProfileDto | null>

  /**
   * 사용자 인덱스(숫자 PK)로 프로필 조회
   */
  abstract executeByUserIdx(userIdx: number): Promise<UserProfileDto | null>

  /**
   * 사용자 ID(문자열)로 프로필 조회 (없으면 예외 발생)
   */
  abstract executeByUserIdOrThrow(userId: string): Promise<UserProfileDto>

  /**
   * 프로필 IDX(기본키)로 프로필 조회 (없으면 예외 발생)
   */
  abstract executeByIdxOrThrow(idx: number): Promise<UserProfileDto>

  /**
   * 사용자 인덱스(숫자 PK)로 프로필 조회 (없으면 예외 발생)
   */
  abstract executeByUserIdxOrThrow(userIdx: number): Promise<UserProfileDto>
}
