/**
 * 오버레이 고유 ID 생성 유틸리티
 * overlay-kit 호환 ID 생성 함수
 */

/**
 * 랜덤 문자열 생성 (overlay-kit 방식)
 *
 * @param length - 생성할 문자열 길이 (기본값: 8)
 * @returns 랜덤 문자열 (소문자 + 숫자)
 */
export function randomId(length: number = 8): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

/**
 * 타임스탬프 기반 고유 ID 생성
 * 더 높은 유일성이 필요한 경우 사용
 */
export function timestampId(): string {
  return `overlay_${Date.now()}_${randomId(4)}`
}

/**
 * UUID v4 스타일 ID 생성
 * 최고 수준의 유일성이 필요한 경우
 */
export function uuidId(): string {
  return crypto.randomUUID()
}
