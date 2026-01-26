import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

import { TokenResponseDto } from "@repo/api-client/src"

import type { SessionUpdatePayload } from "@/shared/auth/strategies/update-strategy.interface"

/**
 *
 * User (authorize 함수 반환 타입)
   credentials.ts의 authorize() 함수가 반환하는 객체
   NextAuth가 로그인 직후 받는 초기 사용자 데이터
   용도: 초기 인증 결과

 * JWT (토큰 저장소)
   jwt() callback에서 관리하는 서버 측 토큰 객체
   브라우저 쿠키에 암호화되어 저장됨
   용도: 세션 간 사용자 정보 유지

 * Session (클라이언트 접근 가능)
   session() callback이 반환하는 클라이언트용 객체
   useSession() 훅으로 접근
   용도: 프론트엔드에서 사용

 * 흐름: authorize() → User → jwt() → JWT → session() → Session
 *
 * SessionUpdatePayload를 extends하여 update() 호출 시 타입 안전성 확보
 */

/**
 * CotePT 사용자 정보 객체
 */
export type LoginResponse = TokenResponseDto
export type CotePtUser = Omit<LoginResponse, "accessToken" | "refreshToken"> & {
  onboardingCompleted?: boolean
  currentOnboardingStep?: number
}
declare module "next-auth" {
  interface Session extends DefaultSession, SessionUpdatePayload {
    member: CotePtUser
  }

  interface User extends DefaultUser, TokenResponseDto {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    member?: CotePtUser
    accessToken?: string
    refreshToken?: string
  }
}
