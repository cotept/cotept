/**
 * @file PermissionGate.tsx
 * @description 권한에 따라 자식 컴포넌트를 보여주거나 숨기는 Gate 컴포넌트
 */

import { Action, Resource, ResourceDataMap, UserContext } from "@repo/common-lib/auth"
import { ReactNode } from "react"

import { useAbility } from "../hooks/useAbility"

interface PermissionGateProps<R extends Resource> {
  children: ReactNode
  /** 현재 사용자 정보 (NextAuth Session 등에서 주입) */
  user: UserContext | null | undefined

  /** 수행하려는 액션 */
  action: Action

  /** 대상 리소스 */
  resource: R

  /** 리소스 데이터 (소유권 확인 등이 필요한 경우) */
  data?: ResourceDataMap[R]

  /** 권한이 없을 때 보여줄 대체 UI (Optional) */
  fallback?: ReactNode
}

export function PermissionGate<R extends Resource>({
  children,
  user,
  action,
  resource,
  data,
  fallback = null,
}: PermissionGateProps<R>) {
  const { can } = useAbility(user)

  if (can(action, resource, data)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
