/**
 * @file conditions.ts
 * @description 권한 정책에서 사용되는 재사용 가능한 조건 함수들 (Conditions)
 */

import { Resource, UserContext, type ResourceDataMap } from "./types"

// ============================================================================
// 소유권 검사 (Ownership)
// ============================================================================

/**
 * 데이터의 'mentorId' 필드가 사용자와 일치하는지 확인
 */
export const isMentorOwner = (data: { mentorId: string | number }, user: UserContext) => {
  return String(data.mentorId) === String(user.id)
}

/**
 * 데이터의 'menteeId' 필드가 사용자와 일치하는지 확인
 */
export const isMenteeOwner = (data: { menteeId: string | number }, user: UserContext) => {
  return String(data.menteeId) === String(user.id)
}

/**
 * 데이터의 'reviewerId' 필드가 사용자와 일치하는지 확인 (리뷰)
 */
export const isReviewer = (data: { reviewerId: string | number }, user: UserContext) => {
  return String(data.reviewerId) === String(user.id)
}

/**
 * 데이터의 'userId' 필드가 사용자와 일치하는지 확인 (일반적)
 */
export const isOwner = (data: { userId: string | number }, user: UserContext) => {
  return String(data.userId) === String(user.id)
}

/**
 * 세션의 참여자(멘토 또는 멘티)인지 확인
 */
export const isSessionParticipant = (data: { mentorId: string | number; menteeId: string | number }, user: UserContext) => {
  return isMentorOwner(data, user) || isMenteeOwner(data, user)
}

// ============================================================================
// 상태 및 시간 검사 (Attribute Based)
// ============================================================================

/**
 * 공개 상태인지 확인 (예: isPublic = true)
 */
export const isPublic = (data: { isPublic?: boolean }, _user: UserContext) => {
  return !!data.isPublic
}

/**
 * 미래의 일정인지 확인 (예: 취소 가능 시간 확인)
 * - startsAt이 현재 시간보다 미래여야 함
 */
export const isFuture = (data: { startsAt?: Date | string | number }, _user: UserContext) => {
  if (!data.startsAt) return false
  const startTime = new Date(data.startsAt).getTime()
  return startTime > Date.now()
}

/**
 * 24시간 전인지 확인 (엄격한 취소 정책 등)
 */
export const is24HoursBefore = (data: { startsAt?: Date | string | number }, _user: UserContext) => {
  if (!data.startsAt) return false
  const startTime = new Date(data.startsAt).getTime()
  const limit = Date.now() + 24 * 60 * 60 * 1000 // 현재 + 24시간
  return startTime > limit
}
