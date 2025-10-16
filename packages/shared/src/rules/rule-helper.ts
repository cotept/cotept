import { z, ZodObject, ZodRawShape, ZodTypeAny } from "zod"

/**
 * Zod 스키마 매핑 타입
 * @template T 대상 객체 타입
 */
export type RuleMap<T> = {
  [K in keyof T]?: T[K] extends Record<string, any> ? RuleMap<T[K]> : ZodTypeAny
}

/**
 * 디바운싱된 함수 타입
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
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
 * 함수 : 모든 validation 통과 true/false
 *- - - - - - - - - - - - - - - - -*/
export const zodValidateToggle = <T extends Record<string, any>>(ruleMap: RuleMap<T>, values: any): boolean => {
  return makeZodSchema(ruleMap).safeParse(values).success
}

/**
 * Zod 스키마를 사용한 데이터 검증
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
