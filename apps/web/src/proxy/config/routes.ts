/**
 * 애플리케이션 라우트 설정 (Source of Truth)
 * - KISS: 경로는 단순 문자열 배열 또는 패턴으로 관리
 * - SoC: 라우트 정의만 담당하며 로직은 포함하지 않음
 */

export const PUBLIC_ROUTES = [
  "/",
  "/landing",
  "/auth/signin", // 로그인 페이지 자체는 Public이어야 함 (순환 참조 방지)
  "/auth/signup",
  "/auth/error",
  "/api/auth", // NextAuth API 경로
  "/main",
] as const

export const AUTH_ROUTES = ["/auth/signin", "/auth/signup"] as const

export const PROTECTED_ROUTES = ["/onboarding", "/mentoring", "/my", "/admin", "/mentor"] as const
// export const PROTECTED_ROUTES = ["/mentoring", "/my"] as const

/**
 * 경로 패턴 매칭을 위한 설정
 * (추후 확장성을 위해 별도 상수로 분리)
 */
export const ROUTE_CONFIG = {
  public: PUBLIC_ROUTES,
  auth: AUTH_ROUTES,
  protected: PROTECTED_ROUTES,
  // admin: ["/admin"], // Future use
} as const
