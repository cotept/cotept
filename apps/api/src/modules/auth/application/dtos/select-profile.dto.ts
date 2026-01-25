/**
 * 프로필 선택 DTO
 * 멘토/멘티 프로필 전환 시 사용
 */
export class SelectProfileDto {
  /**
   * 사용자 ID
   */
  userIdx: number

  /**
   * 선택할 활성 프로필 타입
   * - mentee: 멘티로 활동
   * - mentor: 멘토로 활동
   */
  activeProfile: "mentee" | "mentor"

  constructor(userIdx: number, activeProfile: "mentee" | "mentor") {
    this.userIdx = userIdx
    this.activeProfile = activeProfile
  }
}
