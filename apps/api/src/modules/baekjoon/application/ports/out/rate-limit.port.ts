/**
 * 속도 제한 포트
 * API 호출 속도 제한을 담당하는 아웃바운드 포트
 */
export abstract class RateLimitPort {
  /**
   * 속도 제한 확인 및 적용
   * @param key 속도 제한 키 (사용자 식별자)
   * @param limit 제한 횟수
   * @param windowSeconds 시간 창 (초)
   * @returns 요청이 허용되는지 여부
   */
  abstract checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean>

  /**
   * 속도 제한 정보 조회
   * @param key 속도 제한 키
   * @returns 현재 상태 정보
   */
  abstract getRateLimitInfo(key: string): Promise<RateLimitInfo>

  /**
   * 속도 제한 초기화
   * @param key 속도 제한 키
   */
  abstract resetRateLimit(key: string): Promise<void>

  abstract recordAttempt(key: string): Promise<void>
}

export class RateLimitInfo {
  constructor(
    public readonly limit: number,
    public readonly remaining: number,
    public readonly resetTime: Date,
    public readonly isBlocked: boolean,
  ) {}
}
