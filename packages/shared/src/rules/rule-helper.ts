import { isEmpty, typedEntries, typedFromEntries } from "@repo/shared/lib/utils"
import { z, ZodError, ZodObject, ZodRawShape, ZodSchema, ZodTypeAny } from "zod"

/**
 * Zod 스키마 매핑 타입
 * @template T 대상 객체 타입
 */
export type RuleMap<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? RuleMap<T[K]> : ZodTypeAny
}

/**
 * 개별 필드 검증 결과 (에러 코드 포함)
 */
export interface FieldValidation {
  isValid: boolean
  errors: string[]
  errorCodes: string[]
  errorMessage?: string
}

/**
 * 검증 체크 항목 (UI용)
 */
export interface ValidationCheckItem {
  id: string
  label: string
  isValid: boolean
  errorCode?: string
}

/** - - - - - - - - - - - - - - - - -
 * 내부 함수 : 일반 obj를 zod schema obj로 변환
 *- - - - - - - - - - - - - - - - -*/
const makeZodSchema = <T extends Record<string, any>>(map: RuleMap<T>): ZodObject<any> => {
  const result: ZodRawShape = {}

  // ✅ typedEntries 사용
  typedEntries(map).forEach(([key, val]) => {
    if (val && typeof val === "object" && !("safeParse" in val)) {
      result[key as string] = makeZodSchema(val as RuleMap<any>)
    } else {
      result[key as string] = val as ZodTypeAny
    }
  })

  return z.object(result)
}

/** - - - - - - - - - - - - - - - - -
 * 전체 폼 유효성 체크 (간단한 true/false만 필요할 때 사용)
 *- - - - - - - - - - - - - - - - -*/
export const zodValidateToggle = <T extends Record<string, any>>(ruleMap: RuleMap<T>, values: any): boolean => {
  return makeZodSchema(ruleMap).safeParse(values).success
}

/**
 * 전체 검증 with 에러 메시지 (폼 submit 시 사용)
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  }
}

/**
 * 단일 필드 검증 with 에러 코드 (실시간 validation check용)
 */
export function validateField<T>(fieldSchema: ZodSchema<T>, value: unknown): FieldValidation {
  const result = fieldSchema.safeParse(value)

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      errorCodes: [],
      errorMessage: undefined,
    }
  }

  const errors = result.error.errors.map((e) => e.message)
  const errorCodes = result.error.errors.map((e) => e.code)

  return {
    isValid: false,
    errors,
    errorCodes,
    errorMessage: errors[0] || "유효하지 않은 값입니다", // ✅ 추가
  }
}

/**
 * ValidationCheck 배열 생성 (UI 표시용)
 */
export function createValidationChecks(
  validation: FieldValidation,
  checks: Array<{ id: string; label: string; errorCodes: string[] }>,
): ValidationCheckItem[] {
  return checks.map(({ id, label, errorCodes }) => ({
    id,
    label,
    isValid: !validation.errorCodes.some((code) => errorCodes.includes(code)),
    errorCode: validation.errorCodes.find((code) => errorCodes.includes(code)),
  }))
}

/**
 * 객체 스키마에서 특정 필드만 검증
 */
export function validateObjectField<T extends Record<string, any>>(
  schema: z.ZodObject<any>,
  fieldName: keyof T,
  value: unknown,
): FieldValidation {
  const fieldSchema = schema.shape[fieldName]
  if (!fieldSchema) {
    throw new Error(`Field "${String(fieldName)}" not found in schema`)
  }
  return validateField(fieldSchema, value)
}

/**
 * Zod 에러를 필드별로 그룹화 (react-hook-form 스타일)
 */
export function groupErrorsByField(error: ZodError): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  error.errors.forEach((err) => {
    const fieldName = err.path[0]?.toString() || "unknown"
    if (!grouped[fieldName]) {
      grouped[fieldName] = []
    }
    grouped[fieldName].push(err.message)
  })

  return grouped
}

/**
 * 첫 번째 에러 메시지만 추출 (✅ utils 활용)
 */
export function getFirstFieldError(error: ZodError): Record<string, string> {
  const grouped = groupErrorsByField(error)
  return typedFromEntries(typedEntries(grouped).map(([field, errors]) => [field, errors[0]]))
}

/**
 * 단일 필드 검증 - 간단 버전 (에러 메시지만 반환)
 */
export function validateFieldSimple<T>(fieldSchema: ZodSchema<T>, value: unknown): string | null {
  const result = fieldSchema.safeParse(value)
  return result.success ? null : result.error.errors[0]?.message || "유효하지 않은 값입니다"
}

/**
 * 객체 필드 검증 - 간단 버전
 */
export function validateObjectFieldSimple<T extends Record<string, any>>(
  schema: z.ZodObject<any>,
  fieldName: keyof T,
  value: unknown,
): string | null {
  const fieldSchema = schema.shape[fieldName]
  if (!fieldSchema) return null
  return validateFieldSimple(fieldSchema, value)
}

/**
 * 객체 전체 검증 후 필드별 첫 에러만 추출 (✅ 추가)
 */
export function validateObjectSimple<T>(schema: ZodSchema<T>, data: unknown): Record<string, string> | null {
  const result = schema.safeParse(data)

  if (result.success) return null

  return getFirstFieldError(result.error)
}

/**
 * 필드가 비어있는지 체크 후 검증 (✅ isEmpty 활용)
 */
export function validateFieldWithEmpty<T>(
  fieldSchema: ZodSchema<T>,
  value: unknown,
  emptyMessage: string = "필수 입력 항목입니다",
): FieldValidation {
  // ✅ isEmpty 활용
  if (isEmpty(value)) {
    return {
      isValid: false,
      errors: [emptyMessage],
      errorCodes: [],
      errorMessage: emptyMessage,
    }
  }

  return validateField(fieldSchema, value)
}
