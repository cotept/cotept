import { Session } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export interface GuardContext {
  request: NextRequest
  session: Session | null
  pathName: string
}

export interface ProxyGuard {
  /**
   * 가드 실행 여부를 판단합니다.
   */
  isApplicable(context: GuardContext): boolean

  /**
   * 가드 로직을 실행합니다.
   * 리다이렉트나 처리가 필요하면 NextResponse를 반환하고,
   * 통과시켜야 하면 null을 반환합니다.
   */
  handle(context: GuardContext): NextResponse | null
}
