import { AuthType, AuthVerification } from '@/modules/auth/domain/model/auth-verification';

/**
 * 인증 검증 레포지토리 포트
 * 이메일, SMS 등 인증 코드 관리를 위한 인터페이스입니다.
 */
export abstract class AuthVerificationRepositoryPort {
  /**
   * 새 인증 검증 저장
   * @param verification 인증 검증 객체
   * @returns 저장된 인증 검증
   */
  abstract save(verification: AuthVerification): Promise<AuthVerification>;

  /**
   * ID로 인증 검증 찾기
   * @param id 인증 검증 ID
   * @returns 인증 검증 또는 null
   */
  abstract findById(id: string): Promise<AuthVerification | null>;

  /**
   * 인증 유형과 대상으로 가장 최근 인증 검증 찾기
   * @param authType 인증 유형
   * @param target 인증 대상(이메일, 전화번호 등)
   * @returns 인증 검증 또는 null
   */
  abstract findLatestByTypeAndTarget(authType: AuthType, target: string): Promise<AuthVerification | null>;

  /**
   * 사용자 ID로 인증 검증 목록 찾기
   * @param userId 사용자 ID
   * @returns 인증 검증 목록
   */
  abstract findAllByUserId(userId: string): Promise<AuthVerification[]>;
}
