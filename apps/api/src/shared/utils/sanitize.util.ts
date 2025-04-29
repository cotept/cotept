/**
 * 입력값이 `null`, `undefined`, 또는 빈 문자열(공백 포함)인 경우 `undefined`를 반환하고,
 * 그 외의 값은 그대로 반환합니다.
 *
 * 이 함수는 `null`, `undefined`, 빈 문자열을 명확하게 구분하지 않고
 * `undefined`로 정규화하여 이후 처리 로직을 간결하게 만들어줍니다.
 *
 * 문자열 외의 타입은 그대로 반환됩니다.
 *
 * @template T 입력 값의 타입
 * @param {T | null | undefined} input - 정리할 입력 값
 * @returns {T | undefined} 정리된 입력 값 (`null`, `undefined`, 빈 문자열은 `undefined`로 변환됨)
 *
 * @example
 * sanitizeInput("hello")     // "hello"
 * sanitizeInput("")          // undefined
 * sanitizeInput("   ")       // undefined
 * sanitizeInput(null)        // undefined
 * sanitizeInput(undefined)   // undefined
 * sanitizeInput(123)         // 123
 * sanitizeInput(false)       // false
 */
export function sanitizeInput<T>(input: T | null | undefined): T | undefined {
  if (input === null || input === undefined) return undefined
  if (typeof input === "string" && input.trim() === "") return undefined
  return input
}
