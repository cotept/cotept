import { SocialProvider } from "@/modules/auth/application/dtos"
import { SocialProfileDto } from "@/modules/auth/application/dtos/social-profile.dto"
import { SocialTokenResponseDto } from "@/modules/auth/application/dtos/social-token-response.dto"

/**
 * 소셜 프로필 포트 (아웃바운드 포트)
 * 이 포트는 애플리케이션이 소셜 로그인 제공자와 통신하는 방법을 정의합니다.
 */
export abstract class SocialProfilePort {
  /**
   * 인증 코드로 액세스 토큰 가져오기
   * @param provider 소셜 제공자
   * @param code 인증 코드
   * @param redirectUri 리다이렉트 URI
   * @returns 토큰 응답 정보
   */
  abstract getTokenByCode(provider: SocialProvider, code: string, redirectUri: string): Promise<SocialTokenResponseDto>;

  /**
   * 인증 코드로 소셜 프로필 가져오기
   * @param provider 소셜 제공자
   * @param code 인증 코드
   * @param redirectUri 리다이렉트 URI
   * @returns 소셜 프로필 정보
   */
  abstract getProfileByCode(provider: SocialProvider, code: string, redirectUri: string): Promise<SocialProfileDto>;

  /**
   * 액세스 토큰으로 소셜 프로필 가져오기
   * @param provider 소셜 제공자
   * @param accessToken 액세스 토큰
   * @returns 소셜 프로필 정보
   */
  abstract getProfileByToken(provider: SocialProvider, accessToken: string): Promise<SocialProfileDto>;
  
  /**
   * 리프레시 토큰으로 새 액세스 토큰 갱신
   * @param provider 소셜 제공자
   * @param refreshToken 리프레시 토큰
   * @returns 토큰 응답 정보
   */
  abstract refreshToken(provider: SocialProvider, refreshToken: string): Promise<SocialTokenResponseDto>;
  
  /**
   * 소셜 로그인 URL 생성
   * @param provider 소셜 제공자
   * @param redirectUri 리다이렉트 URI
   * @param state CSRF 방지를 위한 상태 토큰 (선택적)
   * @returns 소셜 로그인 URL
   */
  abstract generateAuthUrl(provider: SocialProvider, redirectUri: string, state?: string): string;
  
  /**
   * 소셜 계정 연결 해제
   * @param provider 소셜 제공자
   * @param accessToken 액세스 토큰
   * @returns 연결 해제 성공 여부
   */
  abstract revokeToken(provider: SocialProvider, accessToken: string): Promise<boolean>;
}