/**
 * @file common.rules.ts
 * @description 프로젝트 전반에서 사용되는 공통 정규식 및 검증 규칙 (순수 TS)
 * 프론트엔드/백엔드 모두에서 사용됩니다.
 */

// ============================================================================
// 정규식 상수
// ============================================================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_DASH: /^((0\d{1,2})-(\d{3,4})-(\d{4})|(1\d{3})-(\d{4}))$/,
  PHONE_DIGITS: /^(0\d{9,10}|1\d{7})$/,
  BUSINESS_NUM: /^\d{3}-\d{2}-\d{5}$/,
  DATE_YYYYMMDD: /^\d{4}-\d{2}-\d{2}$/,
  DATE_8DIGITS: /^\d{8}$/,
  DATE_6DIGITS: /^\d{6}$/,
  KOREAN_ENGLISH: /^[가-힣a-zA-Z]+$/,
  KOREAN_ENGLISH_NUMBER: /^[가-힣a-zA-Z0-9]+$/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
  ONLY_DIGITS: /^\d+$/,
  PASSWORD_STRONG: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/,
} as const

// ============================================================================
// 순수 검증 함수 (유틸리티)
// ============================================================================

export const commonChecks = {
  /** 이메일 형식 검사 */
  isEmail: (val: string): boolean => REGEX.EMAIL.test(val),

  /** 숫자만 포함되어 있는지 검사 */
  isDigits: (val: string): boolean => REGEX.ONLY_DIGITS.test(val),

  /** 전화번호 형식 검사 (하이픈 제외, 숫자만) */
  isPhoneDigits: (val: string): boolean => REGEX.PHONE_DIGITS.test(val),

  /** 사업자등록번호 형식 검사 (하이픈 포함) */
  isBusinessNumber: (val: string): boolean => REGEX.BUSINESS_NUM.test(val),

  /** 날짜 형식 검사 (YYYY-MM-DD) */
  isDateYYYYMMDD: (val: string): boolean => REGEX.DATE_YYYYMMDD.test(val),
}
