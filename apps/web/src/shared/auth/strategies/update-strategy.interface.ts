import { JWT } from "next-auth/jwt"

/** update() 호출 시 전달되는 페이로드 타입 (단일 진실 공급원) */
export interface SessionUpdatePayload {
  /** 전략 패턴 트리거 식별자 */
  trigger?: "TOKEN_REFRESH" | "ONBOARDING_UPDATE"
  /** 토큰 갱신 시 사용 (TOKEN_REFRESH 전략) */
  accessToken?: string
  refreshToken?: string
}

export interface SessionUpdateContext {
  token: JWT
  trigger?: "signIn" | "signUp" | "update"
  session: SessionUpdatePayload
}

export interface UpdateStrategy {
  isApplicable(context: SessionUpdateContext): boolean
  execute(context: SessionUpdateContext): Promise<JWT>
}
