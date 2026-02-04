import { Resource } from "@repo/common-lib/auth"

/**
 * URL 경로와 권한 리소스 간의 매핑 정의
 * - Middleware에서 현재 경로에 필요한 리소스 권한이 무엇인지 판단할 때 사용합니다.
 * - 가장 구체적인 경로가 우선순위를 가집니다. (KISS: 단순 루프 매칭)
 */
export const ROUTE_RESOURCE_MAP: Record<string, Resource> = {
  "/admin": Resource.PAGE_ADMIN,
  "/mentor": Resource.PAGE_MENTOR_DASHBOARD,
  // 마이페이지 내부의 특정 액션 제어가 필요하다면 추가 가능
  // "/my/special-action": Resource.USER_ACCOUNT,
}
