import { LoginSession } from '@/modules/auth/domain/model/login-session';

/**
 * 로그인 세션 레포지토리 포트
 * 사용자 로그인 세션 관리를 위한 인터페이스입니다.
 */
export abstract class LoginSessionRepositoryPort {
  /**
   * 새 로그인 세션 생성
   * @param session 로그인 세션 객체
   * @returns 저장된 세션
   */
  abstract save(session: LoginSession): Promise<LoginSession>;

  /**
   * 세션 ID로 세션 찾기
   * @param id 세션 ID
   * @returns 로그인 세션 또는 null
   */
  abstract findById(id: string): Promise<LoginSession | null>;

  /**
   * 토큰으로 세션 찾기
   * @param token 토큰 문자열
   * @returns 로그인 세션 또는 null
   */
  abstract findByToken(token: string): Promise<LoginSession | null>;

  /**
   * 사용자의 모든 활성 세션 찾기
   * @param userId 사용자 ID
   * @returns 활성 세션 목록
   */
  abstract findActiveSessionsByUserId(userId: string): Promise<LoginSession[]>;

  /**
   * 사용자의 모든 세션 찾기
   * @param userId 사용자 ID
   * @returns 전체 세션 목록
   */
  abstract findAllByUserId(userId: string): Promise<LoginSession[]>;
}
