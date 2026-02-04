/**
 * @file policy.ts
 * @description 역할별 권한 정책 정의 (Single Source of Truth)
 * - 와일드카드 사용 가능 ('mentoring:*')
 * - 집합론(Set Theory) 기반의 정책 병합 지원 (Union)
 */

import {
  is24HoursBefore,
  isMenteeOwner,
  isMentorOwner,
  isOwner,
  isPublic,
  isReviewer,
  isSessionParticipant,
} from "./conditions"
import { Action, Resource, UserRole, type PolicyDefinition } from "./types"

/**
 * [집합론 - 합집합(Union)]
 * 여러 정책 정의를 안전하게 하나로 합칩니다.
 * 중복된 리소스 키가 있을 경우 규칙 배열을 합쳐서(Concat) 기존 권한을 보존합니다.
 */
function mergePolicies(...policies: PolicyDefinition[]): PolicyDefinition {
  return policies.reduce((acc, current) => {
    for (const [resource, rules] of Object.entries(current)) {
      acc[resource] = [...(acc[resource] || []), ...(rules || [])]
    }
    return acc
  }, {} as PolicyDefinition)
}

// ============================================================================
// 1. GUEST (비로그인) 정책
// ============================================================================
const GUEST_POLICY: PolicyDefinition = {
  // 공개된 멘토링 모집글 읽기 허용
  [Resource.MENTORING_POST]: [{ action: Action.READ, conditions: [isPublic] }],
  // 리뷰 읽기 허용
  [Resource.MENTORING_REVIEW]: [Action.READ],
}

// ============================================================================
// 2. MENTEE (기본 회원) 정책
// ============================================================================
const MENTEE_POLICY: PolicyDefinition = mergePolicies(GUEST_POLICY, {
  // --- Mentoring Post ---
  [Resource.MENTORING_POST]: [Action.READ],

  // --- Mentoring Session ---
  [Resource.MENTORING_SESSION]: [
    { action: Action.READ, conditions: [isMenteeOwner] },
    Action.CREATE,
    { action: Action.CANCEL, conditions: [isMenteeOwner, is24HoursBefore] },
    { action: Action.JOIN, conditions: [isMenteeOwner] },
  ],

  // --- Review ---
  [Resource.MENTORING_REVIEW]: [
    Action.READ,
    Action.CREATE,
    { action: Action.UPDATE, conditions: [isReviewer] },
    { action: Action.DELETE, conditions: [isReviewer] },
  ],

  // --- User Profile ---
  [Resource.USER_PROFILE]: [Action.READ, { action: Action.UPDATE, conditions: [isOwner] }],

  // --- User Account ---
  [Resource.USER_ACCOUNT]: [{ action: Action.MANAGE, conditions: [isOwner] }],
})

// ============================================================================
// 3. MENTOR (멘토) 정책
// ============================================================================
const MENTOR_POLICY: PolicyDefinition = mergePolicies(MENTEE_POLICY, {
  // --- Page Access ---
  [Resource.PAGE_MENTOR_DASHBOARD]: [Action.READ],

  // --- Mentoring Post ---
  [Resource.MENTORING_POST]: [
    Action.READ,
    Action.CREATE,
    { action: Action.UPDATE, conditions: [isMentorOwner] },
    { action: Action.DELETE, conditions: [isMentorOwner] },
  ],

  // --- Mentoring Session ---
  [Resource.MENTORING_SESSION]: [
    { action: Action.READ, conditions: [isSessionParticipant] },
    { action: Action.JOIN, conditions: [isMentorOwner] },
    { action: Action.APPROVE, conditions: [isMentorOwner] },
    { action: Action.REJECT, conditions: [isMentorOwner] },
    { action: Action.CANCEL, conditions: [isMentorOwner] },
  ],
})

// ============================================================================
// 4. ADMIN (관리자) 정책
// ============================================================================
const ADMIN_POLICY: PolicyDefinition = {
  [Resource.PAGE_ADMIN]: [Action.READ],
}

// ============================================================================
// 정책 통합 Export
// ============================================================================
export const ROLE_POLICIES: Record<UserRole, PolicyDefinition> = {
  [UserRole.GUEST]: GUEST_POLICY,
  [UserRole.MENTEE]: MENTEE_POLICY,
  [UserRole.MENTOR]: MENTOR_POLICY,
  [UserRole.ADMIN]: ADMIN_POLICY,
}
