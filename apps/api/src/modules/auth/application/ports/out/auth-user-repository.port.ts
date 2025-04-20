import { SocialProvider } from "@/modules/auth/application/dtos/social-login.dto"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"

/**
 * 인증용 사용자 레포지토리 포트
 * 인증 모듈에서 사용자 정보에 접근하는 방법을 정의합니다.
 */
export abstract class AuthUserRepositoryPort {
  /**
   * 이메일로 사용자 찾기
   * @param email 사용자 이메일
   * @returns 인증용 사용자 또는 null
   */
  abstract findByEmail(email: string): Promise<AuthUser | null>

  /**
   * ID로 사용자 찾기
   * @param id 사용자 ID
   * @returns 인증용 사용자 또는 null
   */
  abstract findById(id: string): Promise<AuthUser | null>

  /**
   * 소셜 ID로 사용자 찾기
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @returns 인증용 사용자 또는 null
   */
  abstract findBySocialId(provider: SocialProvider, socialId: string): Promise<AuthUser | null>

  /**
   * 기존 사용자에게 소셜 계정 연결
   * @param userId 사용자 ID
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   * @param profileData 프로필 데이터
   * @returns 성공 여부
   */
  abstract connectSocialAccount(
    userId: string,
    provider: SocialProvider,
    socialId: string,
    accessToken?: string,
    refreshToken?: string,
    profileData?: any,
  ): Promise<boolean>

  /**
   * 소셜 계정으로 새 사용자 생성
   * @param email 이메일
   * @param name 이름
   * @param provider 소셜 제공자
   * @param socialId 소셜 ID
   * @param accessToken 액세스 토큰
   * @param refreshToken 리프레시 토큰
   * @param profileImageUrl 프로필 이미지 URL
   * @param profileData 프로필 데이터
   * @returns 생성된 사용자
   */
  abstract createSocialUser(
    email: string,
    name: string,
    provider: SocialProvider,
    socialId: string,
    accessToken?: string,
    refreshToken?: string,
    profileImageUrl?: string,
    profileData?: any,
  ): Promise<AuthUser>
}
