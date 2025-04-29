/**
 * 인증 로그 저장소 포트
 * 로그인 실패, 토큰 생성 등의 인증 관련 활동 로그를 기록하기 위한 인터페이스입니다.
 */
export abstract class AuthLogStoragePort {
  /**
   * 로그인 활동 기록
   * @param userId 사용자 ID
   * @param ipAddress IP 주소
   * @param userAgent 사용자 에이전트
   * @param success 성공 여부
   * @param details 추가 상세 정보
   */
  abstract logLoginActivity(
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void>;

  /**
   * 토큰 작업 기록
   * @param action 작업 유형(생성, 갱신, 검증, 블랙리스트 등)
   * @param tokenId 토큰 ID
   * @param userId 사용자 ID
   * @param details 추가 상세 정보
   */
  abstract logTokenOperation(
    action: 'GENERATE' | 'REFRESH' | 'VERIFY' | 'BLACKLIST' | 'THEFT_DETECTION',
    tokenId: string,
    userId: string,
    details?: Record<string, any>
  ): Promise<void>;

  /**
   * 인증 코드 발송 기록
   * @param authType 인증 유형
   * @param target 대상(이메일, 전화번호)
   * @param success 성공 여부
   * @param details 추가 상세 정보
   */
  abstract logVerificationCodeSent(
    authType: string,
    target: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void>;

  /**
   * 특정 사용자의 모든 인증 로그 조회
   * @param userId 사용자 ID
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 인증 로그 항목 목록
   */
  abstract getUserLogs(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<Record<string, any>>>;
}
