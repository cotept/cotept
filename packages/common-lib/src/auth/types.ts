/**
 * @file types.ts
 * @description 인가 시스템에서 사용되는 핵심 타입 정의 (Role, Resource, Action, Data)
 */

// ============================================================================
// 1. Enums (역할, 리소스, 액션)
// ============================================================================

/**
 * 사용자 역할 (Role)
 * - 계층 구조를 가지지 않고 평면적이지만, Policy에서 상속 구조를 모방하여 정의함.
 */
export enum UserRole {
  GUEST = "GUEST", // 비로그인
  MENTEE = "MENTEE", // 기본 회원
  MENTOR = "MENTOR", // 멘토
  ADMIN = "ADMIN", // 관리자
}

/**
 * 리소스 (Resource) - 계층형 구조
 * - ':'를 사용하여 계층을 표현합니다. (예: domain:subdomain)
 * - '*' 와일드카드는 정책 정의 시에만 사용합니다.
 */
export enum Resource {
  // --- Pages (접근 제어) ---
  PAGE_ADMIN = "page:admin",
  PAGE_MENTOR_DASHBOARD = "page:mentor:dashboard",

  // --- Mentoring Domain ---
  MENTORING_POST = "mentoring:post",
  MENTORING_SESSION = "mentoring:session",
  MENTORING_REVIEW = "mentoring:review",

  // --- User Domain ---
  USER_PROFILE = "user:profile",
  USER_ACCOUNT = "user:account", // 계정 설정 등 민감 정보
}

/**
 * 액션 (Action)
 * - CRUD 표준 및 비즈니스 로직 전용 액션
 */
export enum Action {
  // Standard CRUD
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",

  // Business Actions
  CANCEL = "cancel", // 예약/세션 취소
  APPROVE = "approve", // 승인
  REJECT = "reject", // 거절
  COMPLETE = "complete", // 완료
  JOIN = "join", // 참여 (화상회의 등)

  // Meta Actions
  MANAGE = "manage", // 모든 권한 (와일드카드 역할)
}

// ============================================================================
// 2. Data Types (리소스별 데이터 구조)
// ============================================================================

/** 기본 ID 타입 */
export type ID = string | number

/**
 * [리소스 데이터 타입 매핑]
 * 각 리소스별로 권한 검사에 필요한 최소한의 데이터 필드를 정의합니다.
 * 실제 DTO 전체가 올 수도 있지만, 여기 정의된 필드는 필수적으로 확인합니다.
 */
export interface ResourceDataMap {
  [Resource.PAGE_ADMIN]: undefined // 데이터 불필요
  [Resource.PAGE_MENTOR_DASHBOARD]: undefined

  [Resource.MENTORING_POST]: {
    mentorId: ID
    isPublic?: boolean
    [key: string]: any
  }

  [Resource.MENTORING_SESSION]: {
    mentorId: ID
    menteeId: ID
    status?: string
    startsAt?: Date | string | number
    [key: string]: any
  }

  [Resource.MENTORING_REVIEW]: {
    reviewerId: ID // 작성자 (멘티)
    targetId?: ID // 대상 (멘토)
    [key: string]: any
  }

  [Resource.USER_PROFILE]: {
    userId: ID
    [key: string]: any
  }

  [Resource.USER_ACCOUNT]: {
    userId: ID
    [key: string]: any
  }
}

// ============================================================================
// 3. Policy & Condition Types
// ============================================================================

/**
 * 사용자 컨텍스트
 * - 권한 검사 시 필요한 사용자 정보
 */
export interface UserContext {
  id: ID
  role: UserRole
  [key: string]: any
}

/**
 * 조건 함수 (Condition Validator) - 동기
 * - 특정 데이터가 주어졌을 때 권한을 허용할지 판단하는 순수 함수
 * @param data 리소스 데이터
 * @param user 사용자 정보
 * @returns boolean
 */
export type ConditionFn<R extends Resource = any> = (data: ResourceDataMap[R], user: UserContext) => boolean

/**
 * 조건 함수 (Condition Validator) - 비동기
 */
export type AsyncConditionFn<R extends Resource = any> = (
  data: ResourceDataMap[R],
  user: UserContext,
) => Promise<boolean>

/**
 * 권한 정의 객체
 * - 단순 Action 허용 또는 조건부 허용
 */
export type PermissionRule<R extends Resource> =
  | Action // 조건 없이 허용
  | {
      action: Action
      conditions: (ConditionFn<R> | AsyncConditionFn<R>)[] // 모든 조건(AND)을 만족해야 함
    }

/**
 * 역할별 권한 정책 맵
 * - Key: Resource (와일드카드 문자열 허용을 위해 string 사용)
 * - Value: 해당 리소스에 대해 허용된 규칙 목록
 */
export type PolicyDefinition = {
  [key in Resource | string]?: PermissionRule<any>[]
}
