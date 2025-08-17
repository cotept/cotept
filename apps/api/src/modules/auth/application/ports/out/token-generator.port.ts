import { RefreshTokenPayload, TokenPair,TokenPayload } from '@/modules/auth/domain/model';

/**
 * 토큰 생성기 포트
 * JWT 토큰 생성 및 검증 기능을 정의하는 인터페이스입니다.
 */
export abstract class TokenGeneratorPort {
  /**
   * 액세스 토큰과 리프레시 토큰 쌍 생성
   * @param userId 사용자 ID
   * @param email 사용자 이메일
   * @param role 사용자 역할
   * @returns 토큰 쌍
   */
  abstract generateTokenPair(userId: string, email: string, role: string): TokenPair;

  /**
   * 액세스 토큰 검증 및 페이로드 추출
   * @param token 토큰 문자열
   * @returns 토큰 페이로드 또는 null
   */
  abstract verifyAccessToken(token: string): TokenPayload | null;

  /**
   * 리프레시 토큰 검증 및 페이로드 추출
   * @param token 토큰 문자열
   * @returns 토큰 페이로드 또는 null
   */
  abstract verifyRefreshToken(token: string): RefreshTokenPayload | null;

  /**
   * 새로운 패밀리 ID 생성
   * @returns 패밀리 ID
   */
  abstract generateFamilyId(): string;

  /**
   * 토큰 ID 생성
   * @returns 토큰 ID
   */
  abstract generateTokenId(): string;
}
