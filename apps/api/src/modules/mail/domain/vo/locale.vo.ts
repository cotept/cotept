import { LocaleType } from "../types/template.types"

/**
 * 언어 설정 값 객체
 * 지원 언어 타입 검증을 담당
 */
export class Locale {
  private readonly value: LocaleType

  private constructor(locale: LocaleType) {
    this.value = locale
  }

  /**
   * 지원되는 언어 목록
   */
  private static readonly SUPPORTED_LOCALES: LocaleType[] = ["ko", "en"]

  /**
   * 기본 언어 (한국어)
   */
  private static readonly DEFAULT_LOCALE: LocaleType = "ko"

  /**
   * 언어 값 객체 생성 팩토리 메서드
   */
  public static of(locale?: LocaleType): Locale {
    // 언어 설정이 없으면 기본값 사용
    if (!locale) {
      return new Locale(this.DEFAULT_LOCALE)
    }

    // 지원되는 언어인지 검증
    if (!this.SUPPORTED_LOCALES.includes(locale)) {
      throw new Error(`지원되지 않는 언어입니다: ${locale}`)
    }

    return new Locale(locale)
  }

  /**
   * 다른 언어 값 객체와 동등 비교
   */
  public equals(other: Locale): boolean {
    return this.value === other.value
  }

  /**
   * 원시 값(string) 반환
   */
  public toString(): string {
    return this.value
  }

  /**
   * 값 반환
   */
  public getValue(): LocaleType {
    return this.value
  }
}
