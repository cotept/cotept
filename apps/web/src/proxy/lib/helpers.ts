import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { Resource } from "@repo/common-lib/auth"

import { ROUTE_RESOURCE_MAP } from "@/proxy/config/role-resource.map"
import { ROUTE_CONFIG } from "@/proxy/config/routes"

/**
 * Functional Helpers for Proxy
 * - Pure functions with no side effects
 * - KISS: Simple logic for matching and redirection
 */

// 타입 가드: 문자열이 보호된 경로로 시작하는지 확인
const startsWith = (path: string, prefix: string) => path.startsWith(prefix)

/**
 * 주어진 경로가 설정된 라우트 목록 중 하나와 매칭되는지 확인 (불변성 유지)
 * @param pathName - 현재 요청 경로
 * @param routes - 확인할 라우트 목록 (readonly)
 */
export const isMatchingRoute = (pathName: string, routes: readonly string[]): boolean => {
  return routes.some((route) => {
    // Root path should match exactly
    if (route === "/") {
      return pathName === "/"
    }
    // Other paths match as prefix
    return startsWith(pathName, route)
  })
}

/**
 * 공개 경로인지 확인
 */
export const isPublicRoute = (pathName: string): boolean => {
  // 1. 명시적 공개 경로 확인
  if (isMatchingRoute(pathName, ROUTE_CONFIG.public)) return true

  // 2. 정적 리소스 및 API 경로 예외 처리 (KISS)
  // _next, images, favicon 등은 항상 허용
  const staticPrefixes = ["/_next", "/images", "/favicon.ico", "/api/auth"]
  if (staticPrefixes.some((prefix) => startsWith(pathName, prefix))) return true

  return false
}

/**
 * 보호된 경로인지 확인
 */
export const isProtectedRoute = (pathName: string): boolean => {
  return isMatchingRoute(pathName, ROUTE_CONFIG.protected)
}

/**
 * 인증 관련 경로(로그인/회원가입)인지 확인
 */
export const isAuthRoute = (pathName: string): boolean => {
  return isMatchingRoute(pathName, ROUTE_CONFIG.auth)
}

/**
 * 현재 경로에 매핑된 리소스(Resource) 찾기 (Longest Prefix Match)
 * - RoleGuard에서 사용
 */
export const getResourceForPath = (pathName: string): Resource | null => {
  // 가장 긴 경로가 우선순위를 가지도록 정렬 (예: /admin/users vs /admin)
  const sortedPaths = Object.keys(ROUTE_RESOURCE_MAP).sort((a, b) => b.length - a.length)
  const matchedPath = sortedPaths.find((route) => startsWith(pathName, route))

  return matchedPath ? ROUTE_RESOURCE_MAP[matchedPath] : null
}

/**
 * 리다이렉트 응답 생성 (함수형 스타일)
 * @param req - 원본 요청
 * @param destination - 이동할 목적지
 * @param searchParams - 추가할 쿼리 파라미터 (옵션)
 */
export const createRedirect = (
  req: NextRequest,
  destination: string,
  searchParams?: Record<string, string>,
): NextResponse => {
  const url = req.nextUrl.clone()
  url.pathname = destination

  // 기존 파라미터 초기화 (KISS: 필요한 것만 새로 설정)
  url.search = ""

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return NextResponse.redirect(url)
}
