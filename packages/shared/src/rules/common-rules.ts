// CotePT 공용 유효성 검사 규칙
import { z, ZodType } from "zod"

/**
 * 기본 필수 입력 규칙 (내부용)
 * @deprecated 직접 사용 금지, requiredRule 사용할 것
 */
const requiredBasic = (message?: string) =>
  z.string({ required_error: message ?? "필수값을 입력해주세요" }).min(1, message ?? "필수값을 입력해주세요")

/**
 * 표준 필수 입력 규칙
 * - 빈 문자열, 공백만으로 된 값, 앞뒤 공백 검증
 * @param message 커스텀 에러 메시지
 */
export const requiredRule = (message?: string) =>
  z
    .string({ required_error: message ?? "필수값을 입력해주세요" })
    .min(1, message ?? "필수값을 입력해주세요")
    .refine((v) => v.trim().length > 0, { message: "공백만 입력할 수 없습니다." })
    .refine((v) => v === v.trim(), { message: "앞뒤 공백 없이 입력해주세요." })

export const requiredNumRule = (message?: string) => z.number().min(1, message ?? "필수값을 입력해주세요")

/** - - - - - - - - - - - - - - - - -
 * 날짜 (YYYY-MM-DD 형식, 유효한 날짜인지 확인)
 *- - - - - - - - - - - - - - - - -*/
export const dayRule = (message?: string): ZodType<string | Date, any, any> =>
  z.union([z.string(), z.date()]).superRefine((val, ctx) => {
    let strVal = ""

    if (val instanceof Date) {
      strVal = val.toISOString().slice(0, 10)
    } else {
      strVal = val
    }

    if (/^\d{8}$/.test(strVal)) {
      strVal = `${strVal.slice(0, 4)}-${strVal.slice(4, 6)}-${strVal.slice(6, 8)}`
    }

    const formatValid = /^\d{4}-\d{2}-\d{2}$/.test(strVal)
    const isValidDate = !isNaN(new Date(strVal).getTime())

    if (!formatValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message ?? "YYYY-MM-DD 형식으로 입력해주세요",
      })
    } else if (!isValidDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: message ?? "존재하지 않는 날짜입니다",
      })
    }
  })

/** - - - - - - - - - - - - - - - - -
 * 생년월일 (숫자 제한 x)
 *- - - - - - - - - - - - - - - - -*/
export const birthRule = (format: "yyMMdd" | "yyyyMMdd", message?: string) => {
  const regex = format === "yyMMdd" ? /^\d{6}$/ : /^\d{8}$/
  const defaultMessage = format === "yyMMdd" ? "6자리(990101)로 입력해주세요" : "8자리(19990101)로 입력해주세요"

  return requiredBasic().regex(regex, message ?? defaultMessage)
}

/** - - - - - - - - - - - - - - - - -
 * 모달input
 *- - - - - - - - - - - - - - - - -*/
export const requiredRuleFromModal = (message?: string) =>
  z.custom<unknown>(
    (val) => {
      if (val === null || val === undefined) return false
      if (typeof val === "string") return val.trim() !== ""
      if (Array.isArray(val)) return val.length > 0
      if (typeof val === "object") return Object.keys(val).length > 0
      return true
    },
    {
      message: message ?? "입력창을 눌러 값을 선택해주세요",
    },
  )

/** - - - - - - - - - - - - - - - - -
 * 사업자등록번호
 *- - - - - - - - - - - - - - - - -*/
export const businessNumberRule = (message?: string) => {
  const regex = /^\d{3}-\d{2}-\d{5}$/
  return requiredBasic().regex(regex, message ?? "000-00-00000 형식으로 입력해주세요")
}

/** - - - - - - - - - - - - - - - - -
 * 전화번호
 *- - - - - - - - - - - - - - - - -*/
export const phoneNumberRule = (message?: string) => {
  const regex = /^((0\d{1,2})-(\d{3,4})-(\d{4})|(1\d{3})-(\d{4}))$/
  return requiredBasic().regex(regex, message ?? "유효한 전화번호 형식이 아닙니다")
}

export const optionPhoneNumberRule = (message?: string) => {
  const regex = /^((0\d{1,2})-(\d{3,4})-(\d{4})|(1\d{3})-(\d{4}))$/
  return z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return regex.test(val)
      },
      { message: message ?? "유효한 전화번호 형식이 아닙니다" },
    )
}

/** - - - - - - - - - - - - - - - - -
 * 이메일
 *- - - - - - - - - - - - - - - - -*/
export const emailRule = (message?: string) =>
  requiredBasic().email({ message: message ?? "올바른 이메일 형식이 아닙니다" })
export const optionEmailRule = (message?: string) => {
  return z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      },
      { message: message ?? "올바른 이메일 형식이 아닙니다" },
    )
}

/** - - - - - - - - - - - - - - - - -
 * 숫자 범위
 *- - - - - - - - - - - - - - - - -*/
export const rangeRule = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      // 빈 문자열이나 undefined/null일 경우 그대로 반환 (zod가 required_error 처리)
      if (value === "" || value === undefined || value === null) return undefined
      return Number(value)
    },
    z
      .number({
        required_error: "숫자를 입력해주세요",
        invalid_type_error: "숫자 형식이 아닙니다",
      })
      .min(min, { message: `${min} 이상의 숫자를 입력해주세요.` })
      .max(max, { message: `${max} 이하의 숫자만 입력 가능합니다.` }),
  )
