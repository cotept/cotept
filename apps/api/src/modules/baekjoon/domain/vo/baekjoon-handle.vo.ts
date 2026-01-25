export class BaekjoonHandle {
  private readonly _value: string

  constructor(value: string) {
    this.validate(value)
    this._value = value.trim()
  }

  get value(): string {
    return this._value
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("백준 핸들은 필수입니다")
    }

    const trimmed = value.trim()

    // 백준 ID 규칙: 3-20자, 영문 소문자, 숫자, 언더스코어만 허용
    if (trimmed.length < 3 || trimmed.length > 20) {
      throw new Error("백준 핸들은 3-20자 사이여야 합니다")
    }

    const validPattern = /^[a-z0-9_]+$/
    if (!validPattern.test(trimmed)) {
      throw new Error("백준 핸들은 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다")
    }
  }

  equals(other: BaekjoonHandle): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }

  static of(value: string): BaekjoonHandle {
    return new BaekjoonHandle(value)
  }
}
