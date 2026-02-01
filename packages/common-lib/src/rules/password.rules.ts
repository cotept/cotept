/**
 * 비밀번호 정책 - 프론트엔드/백엔드 공유
 *
 * 이 파일을 수정하면 프론트/백 모두에 적용됩니다.
 * 변경 시 양쪽 테스트를 모두 실행해주세요.
 */

// ============================================================================
// 상수
// ============================================================================

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 32

/** 허용되는 특수문자 목록 */
export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>/?"

/** 특수문자 정규식 (이스케이프 처리됨) */
export const PASSWORD_SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

// ============================================================================
// 정규식
// ============================================================================

/**
 * 비밀번호 전체 검증 정규식
 * - 8~32자
 * - 소문자 필수
 * - 숫자 필수
 * - 특수문자 필수
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/

/**
 * 연속된 문자/숫자 감지 정규식 (보안 강화용)
 * 예: 123, abc, xyz 등
 */
export const SEQUENTIAL_CHARS_REGEX =
  /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i

// ============================================================================
// 개별 검증 함수
// ============================================================================

export const passwordChecks = {
  /** 최소 길이 검사 */
  hasMinLength: (password: string): boolean => password.length >= PASSWORD_MIN_LENGTH,

  /** 최대 길이 검사 */
  hasMaxLength: (password: string): boolean => password.length <= PASSWORD_MAX_LENGTH,

  /** 소문자 포함 검사 */
  hasLowercase: (password: string): boolean => /[a-z]/.test(password),

  /** 숫자 포함 검사 */
  hasNumber: (password: string): boolean => /\d/.test(password),

  /** 특수문자 포함 검사 */
  hasSpecialChar: (password: string): boolean => PASSWORD_SPECIAL_CHARS_REGEX.test(password),

  /** 연속 문자 없음 검사 */
  hasNoSequential: (password: string): boolean => !SEQUENTIAL_CHARS_REGEX.test(password),
}

// ============================================================================
// 통합 검증 함수
// ============================================================================

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 비밀번호 유효성 검사 (전체)
 * @param password 검증할 비밀번호
 * @param checkSequential 연속 문자 검사 여부 (기본: false)
 */
export function validatePassword(password: string, checkSequential = false): PasswordValidationResult {
  const errors: string[] = []

  if (!password) {
    return { isValid: false, errors: ["비밀번호를 입력해주세요."] }
  }

  if (!passwordChecks.hasMinLength(password)) {
    errors.push(`비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)
  }

  if (!passwordChecks.hasMaxLength(password)) {
    errors.push(`비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자까지 허용됩니다.`)
  }

  if (!passwordChecks.hasLowercase(password)) {
    errors.push("소문자를 포함해주세요.")
  }

  if (!passwordChecks.hasNumber(password)) {
    errors.push("숫자를 포함해주세요.")
  }

  if (!passwordChecks.hasSpecialChar(password)) {
    errors.push("특수문자를 포함해주세요.")
  }

  if (checkSequential && !passwordChecks.hasNoSequential(password)) {
    errors.push("연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// UI용 헬퍼 (ValidationIndicator 호환)
// ============================================================================

export interface PasswordCheckItem {
  id: string
  label: string
  isValid: boolean
}

/**
 * ValidationIndicator 컴포넌트용 체크 배열 생성
 * @param password 현재 비밀번호 값
 */
export function getPasswordCheckItems(password: string): PasswordCheckItem[] {
  return [
    { id: "length", label: `${PASSWORD_MIN_LENGTH}자 이상`, isValid: passwordChecks.hasMinLength(password) },
    { id: "lowercase", label: "소문자", isValid: passwordChecks.hasLowercase(password) },
    { id: "number", label: "숫자", isValid: passwordChecks.hasNumber(password) },
    { id: "special", label: "특수문자", isValid: passwordChecks.hasSpecialChar(password) },
  ]
}

/**
 * 모든 비밀번호 조건 충족 여부
 * @param password 현재 비밀번호 값
 */
export function isPasswordValid(password: string): boolean {
  return (
    passwordChecks.hasMinLength(password) &&
    passwordChecks.hasMaxLength(password) &&
    passwordChecks.hasLowercase(password) &&
    passwordChecks.hasNumber(password) &&
    passwordChecks.hasSpecialChar(password)
  )
}

// ============================================================================
// 에러 메시지 (백엔드 DTO용)
// ============================================================================

export const PASSWORD_ERROR_MESSAGES = {
  required: "비밀번호는 필수 항목입니다.",
  string: "비밀번호는 문자열이어야 합니다.",
  minLength: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
  maxLength: `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`,
  pattern: "비밀번호는 최소 하나의 소문자, 숫자, 특수문자를 포함해야 합니다.",
  sequential: "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다.",
} as const
