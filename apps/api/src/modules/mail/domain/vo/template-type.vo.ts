import { TemplateNames } from "../types/template.types"

/**
 * 메일 템플릿 타입 값 객체
 * 유효한 템플릿 타입 검증을 담당
 */
export class TemplateType {
  private readonly value: TemplateNames

  private constructor(templateType: TemplateNames) {
    this.value = templateType
  }

  /**
   * 지원되는 템플릿 타입 목록
   */
  private static readonly SUPPORTED_TEMPLATES: TemplateNames[] = [
    'email_verification',
    'password_recovery',
    'reservation_create',
    'reservation_fix',
    'reservation_cancel',
    'reservation_change',
    'reservation_prenotice',
    'verification_code'
  ]

  /**
   * 템플릿 타입 값 객체 생성 팩토리 메서드
   */
  public static of(templateType: string): TemplateType {
    if (!this.SUPPORTED_TEMPLATES.includes(templateType as TemplateNames)) {
      throw new Error(`유효하지 않은 템플릿 타입입니다: ${templateType}`)
    }

    return new TemplateType(templateType as TemplateNames)
  }

  /**
   * 다른 템플릿 타입 값 객체와 동등 비교
   */
  public equals(other: TemplateType): boolean {
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
  public getValue(): TemplateNames {
    return this.value
  }
}
