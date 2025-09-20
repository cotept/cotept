import MentorProfile from "@/modules/mentor/domain/model/mentor-profile"

/**
 * 멘토 프로필 조회 유스케이스 인터페이스
 * 이 포트는 외부에서 멘토 프로필 정보를 조회하는 기능을 정의합니다.
 */
export abstract class GetMentorProfileUseCase {
  /**
   * 사용자 ID로 멘토 프로필 조회
   * @param userId 사용자 ID
   * @returns 멘토 프로필 정보 DTO
   */
  abstract getByUserId(userId: string): Promise<MentorProfile>
  abstract getByIdx(userIdx: number): Promise<MentorProfile>
}
