import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer"

export abstract class BaseMapper<Domain, Entity> {
  abstract toDomain(entity: Entity): Domain
  abstract toEntity(domain: Domain): Entity

  toDomainList(entities: Entity[]): Domain[] {
    return entities.map((e) => this.toDomain(e))
  }

  toEntityList(domains: Domain[]): Entity[] {
    return domains.map((d) => this.toEntity(d))
  }

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

  static numberToBoolean(value: number | undefined): boolean {
    return value === 1
  }

  /**
   * 기본 instanceToPlain (옵션 통일)
   */
  static toPlain<T>(instance: T): any {
    return instanceToPlain(instance, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    })
  }

  /**
   * 기본 plainToInstance (생성자 직접 호출)
   */
  static fromPlain<T>(cls: ClassConstructor<T>, plain: any): T {
    return plainToInstance(cls, plain, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    })
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
