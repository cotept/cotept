import {
  ClassConstructor,
  ClassTransformOptions,
  instanceToPlain as libInstanceToPlain,
  plainToInstance as libPlainToInstance,
} from "class-transformer"

/**
 * 공통 매퍼 유틸리티 클래스
 * static 메서드들만 제공하여 모든 매퍼에서 공통으로 사용
 */
export abstract class BaseMapper {
  /**
   * class-transformer의 plainToInstance를 래핑한 순수 함수.
   * 라이브러리 의존성을 이 파일로 격리합니다.
   */
  static plainToInstance<T, V>(cls: ClassConstructor<T>, plain: V, options?: ClassTransformOptions): T {
    return libPlainToInstance(cls, plain, {
      excludeExtraneousValues: true, // 클래스에 @Expose/@Exclude 없는 필드는 제외
      enableImplicitConversion: true, // 타입에 맞게 자동 변환 시도
      ...options,
    })
  }

  /**
   * class-transformer의 instanceToPlain을 래핑한 순수 함수.
   */
  static instanceToPlain<T, R>(object: T, options?: ClassTransformOptions): R {
    return libInstanceToPlain(object, {
      // 기본적으로 모든 필드를 노출 (필요시 @Exclude로 제어)
      excludeExtraneousValues: false, // @Expose/@Exclude 없는 필드도 포함
      exposeUnsetFields: false, // undefined 필드는 제외
      ...options, // 외부에서 전달된 옵션으로 덮어쓰기 가능
    }) as R
  }
  // static instanceToPlain<T, R>(object: T, options?: ClassTransformOptions): R {
  //   return libInstanceToPlain(object, {
  //     // 기본적으로 모든 필드를 노출 (필요시 @Exclude로 제어)
  //     excludeExtraneousValues: false, // @Expose/@Exclude 없는 필드도 포함
  //     exposeUnsetFields: false, // undefined 필드는 제외
  //     ...options, // 외부에서 전달된 옵션으로 덮어쓰기 가능
  //   }) as R
  // }

  /**
   * 안전한 값 변환 - 에러 시 undefined 반환
   */
  static safeTransform<T>(value: any, transformer: (v: any) => T): T | undefined {
    try {
      return value !== null && value !== undefined ? transformer(value) : undefined
    } catch (error) {
      console.warn("MapperUtils.safeTransform failed:", error)
      return undefined
    }
  }

  /**
   * 조건부 변환 - 조건이 참일 때만 변환
   */
  static conditionalTransform<T>(value: any, condition: boolean, transformer: (v: any) => T): T | undefined {
    return condition && value !== null && value !== undefined ? this.safeTransform(value, transformer) : undefined
  }

  /**
   * 배열 안전 변환
   */
  static transformArray<T, R>(items: T[] | null | undefined, transformer: (item: T) => R): R[] {
    if (!Array.isArray(items)) return []

    return items.map((item) => this.safeTransform(item, transformer)).filter((item): item is R => item !== undefined)
  }

  /**
   * boolean 숫자 변환 (Oracle DB용)
   */
  static booleanToNumber(value: boolean | undefined): number {
    return value ? 1 : 0
  }

  static numberToBoolean(value: number | null | undefined): boolean {
    return value === 1
  }

  /**
   * 값 객체 변환 헬퍼
   */
  static transformValueObject<T>(value: string | undefined, factory: (value: string) => T): T | undefined {
    return value ? this.safeTransform(value, factory) : undefined
  }

  /**
   * 중첩 객체 변환
   */
  static transformNested<T, R>(value: T | undefined, transformer: (item: T) => R): R | undefined {
    return value ? this.safeTransform(value, transformer) : undefined
  }

  /**
   * 필드 존재 여부 확인
   */
  static hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== ""
  }

  /**
   * 기본값 제공
   */
  static withDefault<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue
  }
}
