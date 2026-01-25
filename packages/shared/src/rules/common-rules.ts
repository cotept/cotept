/**
 * @fileoverview 프로젝트 공통 Validation Rules
 * @description 복잡한 도메인 로직 + 자주 재사용되는 패턴만 헬퍼화
 */

import { z } from "zod"

/**
 * ------------------------------------------------------------------
 * 1. 정규식 상수 (재사용 많음)
 * ------------------------------------------------------------------
 */
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

/**
 * ------------------------------------------------------------------
 * 2. 복잡한 도메인 로직 헬퍼 (재사용 많음)
 * ------------------------------------------------------------------
 */

/**
 * 이메일 검증
 * - 자동 trim, 소문자 변환
 * - 길이 제한 (254자)
 * - 이메일 포맷 검증
 */
export const email = (message = "올바른 이메일 형식이 아닙니다") =>
  z
    .string({ required_error: message, invalid_type_error: "이메일은 문자열이어야 합니다" })
    .min(1, message)
    .email(message)
    .max(254, "이메일이 너무 깁니다")
    .transform((email) => email.toLowerCase().trim())

/**
 * 전화번호 검증 (느슨한 검증)
 * - 하이픈/공백 자동 제거
 * - 숫자만 9-11자리 검증
 */
export const phone = (message = "올바른 전화번호 형식이 아닙니다") =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .transform((val) => val.replace(/[-\s]/g, ""))
    .refine((val) => REGEX.PHONE_DIGITS.test(val), message)

/**
 * 전화번호 검증 (엄격한 검증)
 * - 하이픈 포함 정확한 포맷 검증
 * - 예: 010-1234-5678, 02-1234-5678
 */
export const phoneStrict = (message = "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)") =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .refine((val) => REGEX.PHONE_DASH.test(val), message)

/**
 * 사업자등록번호 검증
 * - 포맷: 000-00-00000
 */
export const businessNumber = (message = "올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)") =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .refine((val) => REGEX.BUSINESS_NUM.test(val), message)

/**
 * 날짜 검증 (YYYY-MM-DD)
 * - Date 객체 자동 변환
 * - 8자리 숫자(YYYYMMDD) 자동 변환
 * - 유효한 날짜인지 검증
 */
export const date = (message = "올바른 날짜 형식이 아닙니다") =>
  z
    .union([z.string(), z.date()], { required_error: message })
    .transform((val) => {
      if (val instanceof Date) return val.toISOString().slice(0, 10)
      if (REGEX.DATE_8DIGITS.test(val)) {
        return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
      }
      return val
    })
    .refine((val) => REGEX.DATE_YYYYMMDD.test(val), "YYYY-MM-DD 형식이어야 합니다")
    .refine((val) => !isNaN(new Date(val).getTime()), "존재하지 않는 날짜입니다")

/**
 * 생년월일 6자리 (YYMMDD)
 * - 예: 990101
 */
export const birthYYMMDD = (message = "생년월일 6자리를 입력해주세요 (예: 990101)") =>
  z
    .string({ required_error: message })
    .trim()
    .length(6, message)
    .refine((val) => REGEX.DATE_6DIGITS.test(val), "숫자 6자리를 입력해주세요")

/**
 * 생년월일 8자리 (YYYYMMDD)
 * - 예: 19990101
 */
export const birthYYYYMMDD = (message = "생년월일 8자리를 입력해주세요 (예: 19990101)") =>
  z
    .string({ required_error: message })
    .trim()
    .length(8, message)
    .refine((val) => REGEX.DATE_8DIGITS.test(val), "숫자 8자리를 입력해주세요")

/**
 * 이미지 파일 검증
 * - 파일 크기 제한
 * - 파일 타입 제한
 */
export const imageFile = (maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp"]) =>
  z
    .instanceof(File)
    .refine((file) => file.size <= maxSizeMB * 1024 * 1024, `이미지 크기는 ${maxSizeMB}MB 이하여야 합니다`)
    .refine(
      (file) => allowedTypes.includes(file.type),
      `${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")} 형식의 이미지만 업로드할 수 있습니다`,
    )
/**
 * 파일 검증 (범용)
 * - 모든 파일 타입 지원
 */
export const file = (maxSizeMB = 10, allowedTypes?: string[]) => {
  let schema = z
    .instanceof(File)
    .refine((file) => file.size <= maxSizeMB * 1024 * 1024, `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`)

  if (allowedTypes && allowedTypes.length > 0) {
    schema = schema.refine((file) => allowedTypes.includes(file.type), `허용된 파일 형식: ${allowedTypes.join(", ")}`)
  }

  return schema
}

/**
 * 선택 항목 검증 (셀렉트/모달)
 * - 다양한 타입 지원 (string, number, array, object)
 * - null/undefined/빈 값 체크
 */
export const selection = (message = "항목을 선택해주세요") =>
  z.custom<unknown>(
    (val) => {
      if (val === null || val === undefined) return false
      if (typeof val === "string") return val.trim().length > 0
      if (Array.isArray(val)) return val.length > 0
      if (typeof val === "number") return true
      if (typeof val === "object") return Object.keys(val).length > 0
      return true
    },
    { message },
  )

/**
 * URL 검증
 * - http/https 프로토콜 검증
 */
export const url = (message = "올바른 URL 형식이 아닙니다") =>
  z.string({ required_error: message }).trim().min(1, message).url(message)

/**
 * 색상 코드 검증 (HEX)
 * - 예: #000000, #fff
 */
export const hexColor = (message = "올바른 색상 코드가 아닙니다 (예: #000000)") =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message)

/**
 * JSON 문자열 검증 및 파싱
 */
export const jsonString = <T = unknown>(message = "올바른 JSON 형식이 아닙니다") =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as T
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
        })
        return z.NEVER
      }
    })

/**
 * 필수 약관 동의 (true만 허용)
 */
export const requiredAgreement = (message = "필수 약관에 동의해야 합니다") =>
  z.boolean({ required_error: message }).refine((val) => val === true, message)

/**
 * 선택 약관 동의 (기본값: false)
 */
export const optionalAgreement = () => z.boolean().optional().default(false)
