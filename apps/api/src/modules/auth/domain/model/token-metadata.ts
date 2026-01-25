/**
 * JWT 토큰 메타데이터 타입
 * 토큰에 포함할 추가 정보를 타입 안전하게 정의합니다.
 */
export interface TokenMetadata {
  /**
   * 활성 프로필 타입
   * 멘토 사용자가 현재 사용 중인 프로필 (mentee 또는 mentor)
   */
  activeProfile?: "mentee" | "mentor"

  // 향후 필요한 메타데이터를 여기에 추가
  // 예: sessionId?: string
  // 예: deviceId?: string
}
