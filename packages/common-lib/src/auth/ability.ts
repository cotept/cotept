/**
 * @file ability.ts
 * @description 인가 시스템의 핵심 엔진 (Core Engine)
 * - 와일드카드 매칭
 * - 조건부 검사 실행 (동기/비동기)
 * - 디버깅 로깅
 */

import { ROLE_POLICIES } from "./policy"
import { Action, Resource, UserRole, type ResourceDataMap, type UserContext } from "./types"

/**
 * 개발 모드 여부
 */
const IS_DEV = typeof process !== "undefined" && process.env.NODE_ENV === "development"

/**
 * 리소스 패턴 매칭 (와일드카드 지원)
 */
function matchResource(target: string, pattern: string): boolean {
  if (target === pattern) return true
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1)
    return target.startsWith(prefix)
  }
  return false
}

/**
 * 권한 검사 함수 (동기 - UI 렌더링용)
 * - 주의: 비동기 조건이 정책에 포함되어 있을 경우, 해당 조건은 'false'로 처리됩니다.
 * - 비동기 조건이 확실히 없는 경우에만 사용하거나, canAsync를 사용하세요.
 */
export function can<R extends Resource>(
  user: UserContext | null | undefined,
  action: Action,
  resource: R,
  data?: ResourceDataMap[R],
): boolean {
  const currentUser = user || { id: "guest", role: UserRole.GUEST }

  if (currentUser.role === UserRole.ADMIN) {
    debugLog(true, "ADMIN Superpass", { user: currentUser, action, resource })
    return true
  }

  const policy = ROLE_POLICIES[currentUser.role]
  if (!policy) {
    debugLog(false, "No policy found for role", { role: currentUser.role })
    return false
  }

  const matchedRules = Object.entries(policy)
    .filter(([pattern]) => matchResource(resource, pattern))
    .flatMap(([, rules]) => rules || [])

  if (matchedRules.length === 0) {
    debugLog(false, "No rules matched for resource", { resource })
    return false
  }

  const hasPermission = matchedRules.some((rule) => {
    if (typeof rule === "string") {
      return rule === action || rule === Action.MANAGE
    }

    if (rule.action !== action && rule.action !== Action.MANAGE) {
      return false
    }

    if (rule.conditions && rule.conditions.length > 0) {
      if (!data) return false

      return rule.conditions.every((condition) => {
        const result = condition(data, currentUser)
        // 동기 can 함수에서 Promise가 반환되면 실패로 간주 (경고 출력)
        if (result instanceof Promise) {
          if (IS_DEV) console.error(`[Auth] Async condition detected in sync 'can()' call for ${resource}. Access denied.`)
          return false
        }
        return result
      })
    }

    return true
  })

  debugLog(hasPermission, hasPermission ? "Access Granted (Sync)" : "Access Denied (Sync)", {
    user: currentUser,
    action,
    resource,
    data,
  })

  return hasPermission
}

/**
 * 권한 검사 함수 (비동기 - API Guard / Server Side용)
 */
export async function canAsync<R extends Resource>(
  user: UserContext | null | undefined,
  action: Action,
  resource: R,
  data?: ResourceDataMap[R],
): Promise<boolean> {
  const currentUser = user || { id: "guest", role: UserRole.GUEST }

  if (currentUser.role === UserRole.ADMIN) {
    debugLog(true, "ADMIN Superpass (Async)", { user: currentUser, action, resource })
    return true
  }

  const policy = ROLE_POLICIES[currentUser.role]
  if (!policy) return false

  const matchedRules = Object.entries(policy)
    .filter(([pattern]) => matchResource(resource, pattern))
    .flatMap(([, rules]) => rules || [])

  if (matchedRules.length === 0) return false

  // 비동기 처리를 위해 for...of 사용 (또는 Promise.all)
  for (const rule of matchedRules) {
    if (typeof rule === "string") {
      if (rule === action || rule === Action.MANAGE) return true
      continue
    }

    if (rule.action === action || rule.action === Action.MANAGE) {
      if (!rule.conditions || rule.conditions.length === 0) return true
      if (!data) continue

      // 모든 조건을 비동기로 평가
      const results = await Promise.all(rule.conditions.map((c) => Promise.resolve(c(data, currentUser))))
      if (results.every((r) => r)) return true
    }
  }

  debugLog(false, "Access Denied (Async)", { user: currentUser, action, resource, data })
  return false
}

/**
 * 디바운싱된 로깅을 지원할 수도 있으나, 일단 단순하게 유지
 */
function debugLog(allowed: boolean, message: string, context: any) {
  if (!IS_DEV) return

  const style = allowed ? "color: green; font-weight: bold;" : "color: red; font-weight: bold;"
  console.groupCollapsed(`%c[Auth] ${message}`, style)
  console.log("Context:", context)
  console.groupEnd()
}
