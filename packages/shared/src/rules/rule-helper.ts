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

  for (const key in map) {
    const val = map[key]
    if (val && typeof val === "object" && !("safeParse" in val)) {
      // 재귀 함수 처리
      result[key] = makeZodSchema(val as RuleMap<any>)
    } else {
      result[key] = val as ZodTypeAny
    }
  }

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
 * @param schema
 * @param data
 * @returns
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
    return { isValid: true, errors: [], errorCodes: [] }
  }

  return {
    isValid: false,
    errors: result.error.errors.map((e) => e.message),
    errorCodes: result.error.errors.map((e) => e.code),
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
 * 첫 번째 에러 메시지만 추출
 */
export function getFirstFieldError(error: ZodError): Record<string, string> {
  const grouped = groupErrorsByField(error)
  return Object.fromEntries(Object.entries(grouped).map(([field, errors]) => [field, errors[0]]))
}
