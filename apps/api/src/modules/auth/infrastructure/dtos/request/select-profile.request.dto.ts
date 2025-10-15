/**
 * 프로필 선택 DTO
 * 멘토/멘티 프로필 전환 시 사용
 */
export class SelectProfileRequestDto {
  /**
   * 사용자 ID
   */
  userId: string

  /**
   * 선택할 활성 프로필 타입
   * - mentee: 멘티로 활동
   * - mentor: 멘토로 활동
   */
  activeProfile: "mentee" | "mentor"

  constructor(userId: string, activeProfile: "mentee" | "mentor") {
    this.userId = userId
    this.activeProfile = activeProfile
  }
}
