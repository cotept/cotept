/**
 * @file useAbility.ts
 * @description 인가 로직을 React 컴포넌트에서 쉽게 사용할 수 있게 해주는 Hook
 * - 특정 인증 라이브러리(NextAuth 등)에 의존하지 않고, User 객체를 주입받아 동작합니다.
 */

import { Action, can, canAsync, Resource, ResourceDataMap, UserContext } from "@repo/common-lib/auth"
import { useMemo } from "react"

export interface UseAbilityResult {
  /**
   * 동기 권한 검사
   * UI 렌더링 중 조건부 표시를 위해 사용
   */
  can: <R extends Resource>(action: Action, resource: R, data?: ResourceDataMap[R]) => boolean

  /**
   * 비동기 권한 검사
   * 이벤트 핸들러 등에서 비동기 로직이 필요한 경우 사용
   */
  canAsync: <R extends Resource>(action: Action, resource: R, data?: ResourceDataMap[R]) => Promise<boolean>
}

/**
 * useAbility Hook
 * @param user 현재 사용자 정보 (Context)
 */
export function useAbility(user: UserContext | null | undefined): UseAbilityResult {
  // can 함수들은 순수 함수이므로 메모이제이션 비용이 크지 않지만,
  // user 객체가 변경될 때만 재생성되도록 함.
  const ability = useMemo(
    () => ({
      can: <R extends Resource>(action: Action, resource: R, data?: ResourceDataMap[R]) => {
        return can(user, action, resource, data)
      },
      canAsync: <R extends Resource>(action: Action, resource: R, data?: ResourceDataMap[R]) => {
        return canAsync(user, action, resource, data)
      },
    }),
    [user],
  )

  return ability
}
