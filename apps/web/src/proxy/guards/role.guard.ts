import { NextResponse } from "next/server"

import { Action, can, UserContext, UserRole } from "@repo/common-lib/auth"

import { createRedirect, getResourceForPath } from "../lib/helpers"

import { GuardContext, ProxyGuard } from "./guard.interface"

/**
 * 역할 기반 접근 제어 (RBAC) 가드
 * - 현재 경로에 필요한 리소스 권한을 확인합니다.
 * - @repo/common-lib/auth의 순수 로직을 재사용합니다.
 */
export class RoleGuard implements ProxyGuard {
  isApplicable(context: GuardContext): boolean {
    // 1. 매핑된 리소스가 있는 경로인지 확인
    return !!getResourceForPath(context.pathName)
  }

  handle(context: GuardContext): NextResponse | null {
    const { request, session, pathName } = context

    // 1. 사용자 컨텍스트 준비
    // session.member가 있으면 해당 정보 사용, 없으면 Guest 취급
    const member = session?.member
    const userContext: UserContext | null = member
      ? {
          id: member.idx || "unknown",
          role: (member.role as UserRole) || UserRole.MENTEE,
        }
      : null

    // 2. 현재 경로에 해당하는 리소스 찾기
    const resource = getResourceForPath(pathName)

    if (!resource) return null

    // 3. 권한 검사 (READ 액션 기준 - 페이지 진입이므로)
    // common-lib의 can 함수는 내부적으로 Guest 권한도 처리함
    const isAllowed = can(userContext, Action.READ, resource)

    if (!isAllowed) {
      // 3-1. 비로그인 유저가 막힌 경우 -> 로그인 페이지로
      if (!session) {
        return createRedirect(request, "/auth/signin", {
          callbackUrl: pathName,
        })
      }

      // 3-2. 로그인 유저가 권한이 없는 경우 -> 403 에러 페이지로
      return createRedirect(request, "/auth/error", { code: "forbidden" })
    }

    return null
  }
}
