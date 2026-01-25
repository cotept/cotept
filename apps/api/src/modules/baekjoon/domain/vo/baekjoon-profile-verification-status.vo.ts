// domain/vo/baekjoon-profile-verification-status.ts

/**
 * 백준 프로필 인증 상태 상수
 * Oracle DB enum 미지원으로 인한 const object 패턴 사용
 */
export const BaekjoonProfileVerificationStatus = {
  PENDING: "PENDING", // 인증 대기 중
  VERIFIED: "VERIFIED", // 인증 완료
  REJECTED: "REJECTED", // 인증 거부
} as const // ⭐ 중요: as const로 readonly 타입 만들기

// 타입 추출
export type BaekjoonProfileVerificationStatusType =
  (typeof BaekjoonProfileVerificationStatus)[keyof typeof BaekjoonProfileVerificationStatus]

// 유틸리티 함수들
export const BaekjoonProfileVerificationStatusUtils = {
  /**
   * 모든 상태 값 반환
   */
  getAllStatuses(): BaekjoonProfileVerificationStatusType[] {
    return Object.values(BaekjoonProfileVerificationStatus)
  },

  /**
   * 유효한 상태인지 검증
   */
  isValid(status: string): status is BaekjoonProfileVerificationStatusType {
    return Object.values(BaekjoonProfileVerificationStatus).includes(status as BaekjoonProfileVerificationStatusType)
  },

  /**
   * 문자열을 안전하게 상태 값으로 변환
   */
  parse(status: string): BaekjoonProfileVerificationStatusType | null {
    return this.isValid(status) ? status : null
  },

  /**
   * 사용자 친화적 메시지 반환
   */
  getDisplayName(status: BaekjoonProfileVerificationStatusType): string {
    switch (status) {
      case BaekjoonProfileVerificationStatus.PENDING:
        return "인증 대기 중"
      case BaekjoonProfileVerificationStatus.VERIFIED:
        return "인증 완료"
      case BaekjoonProfileVerificationStatus.REJECTED:
        return "인증 거부"
      default:
        return "알 수 없음"
    }
  },

  /**
   * 모든 상태와 표시명을 객체 배열로 반환 (UI용)
   */
  getStatusOptions(): Array<{ value: BaekjoonProfileVerificationStatusType; label: string }> {
    return this.getAllStatuses().map((status) => ({
      value: status,
      label: this.getDisplayName(status),
    }))
  },
}
