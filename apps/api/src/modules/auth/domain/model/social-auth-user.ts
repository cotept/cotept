import { AuthUser } from "./auth-user"

export enum SocialProvider {
  GOOGLE = "google",
  KAKAO = "kakao",
  NAVER = "naver",
  GITHUB = "github",
}

/**
 * 소셜 인증 사용자 정보
 */
export class SocialAuthUser {
  constructor(
    public readonly id: string,
    public readonly provider: string,
    public readonly providerUserId: string,
    public readonly email: string | null,
    public readonly name: string | null,
    public readonly profileImageUrl: string | null,
    private readonly _user: AuthUser | null = null,
  ) {}

  /**
   * 연결된 계정 조회
   */
  get user(): AuthUser | null {
    return this._user
  }

  /**
   * 이 소셜 계정이 기존 사용자 계정과 연결되어 있는지 확인
   */
  get isLinked(): boolean {
    return this._user !== null
  }

  /**
   * 이 소셜 인증 사용자의 고유 식별자 생성
   */
  get uniqueIdentifier(): string {
    return SocialAuthUser.createUniqueIdentifier(this.provider, this.providerUserId)
  }

  /**
   * 새로운 SocialAuthUser를 생성하되, 기존 사용자 계정과 연결
   */
  withUser(user: AuthUser): SocialAuthUser {
    return new SocialAuthUser(
      this.id,
      this.provider,
      this.providerUserId,
      this.email,
      this.name,
      this.profileImageUrl,
      user,
    )
  }

  /**
   * 소셜 인증 사용자의 고유 식별자 생성
   * 이 식별자는 소셜 제공자와 제공자 사용자 ID의 조합
   */
  static createUniqueIdentifier(provider: string, providerUserId: string): string {
    return `${provider}:${providerUserId}`
  }

  /**
   * 소셜 프로필 데이터로부터 SocialAuthUser 생성
   */
  static fromSocialProfile(id: string, profile: any): SocialAuthUser {
    return new SocialAuthUser(
      id,
      profile.provider,
      profile.id,
      profile.email || null,
      profile.name || null,
      profile.profileImageUrl || null,
    )
  }
}
