// DeepPartial (재귀적 Partial)
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

// DeepRequired (재귀적 Required)
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>
    }
  : T

// DeepReadonly (재귀적 Readonly)
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>
    }
  : T

// DeepNonNullable (재귀적 NonNullable)
export type DeepNonNullable<T> = T extends object
  ? {
      [P in keyof T]: DeepNonNullable<NonNullable<T[P]>>
    }
  : NonNullable<T>

/**
 * 5. Mutable & DeepMutable
 * readonly 속성을 제거하여 수정 가능한 타입으로 변환
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type DeepMutable<T> = T extends object
  ? {
      -readonly [P in keyof T]: DeepMutable<T[P]>
    }
  : T

/**
 * PickByType
 * @example type User = { id: number; name: string; age: number; email: string }
 * type StringProps = PickByType<User, string> // { name: string; email: string }
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
}

/**
 * OmitByType
 * @example type User = { id: number; name: string; age: number; email: string }
 * type StringProps = OmitByType<User, string> // { id: number; age: number }
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
}

/**
 * PartialBy
 * @example type User = { id: number; name: string; email: string }
 * type PartialEmail = PartialBy<User, 'email'> // id, name은 필수, email은 선택
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * RequiredBy
 * @example type User = { id?: number; name?: string; email: string }
 * type RequiredId = RequiredBy<User, 'id'> // id는 필수, name과 email은 선택
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/** - - - - - - - - - - - - - - - - -
 * 조건부 타입
 *- - - - - - - - - - - - - - - - -*/
// IsEqual (타입 동일성 검사)
export type IsEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? true : false

export type GetRequired<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K]
}

export type GetOptional<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? never : K]: T[K]
}

export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

export type JSONObject = { [key: string]: JSONValue }

// DeepJsonSerializable (직렬화 가능 타입)
export type DeepJsonSerializable<T> = T extends string | number | boolean | null
  ? T
  : T extends Function
    ? never
    : T extends object
      ? { [K in keyof T]: DeepJsonSerializable<T[K]> }
      : never

/**
 * 중첩 객체의 모든 경로를 문자열 리터럴 유니온으로 추출
 * @example
 * type User = { profile: { name: string; settings: { theme: string } } }
 * type Paths = PathsToProps<User>
 * // "profile" | "profile.name" | "profile.settings" | "profile.settings.theme"
 */
export type PathsToProps<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? T[K] extends object
          ? `${Prefix}${K}` | PathsToProps<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never
    }[keyof T]
  : never

/**
 * 경로 문자열로부터 값의 타입 추론
 * @example
 * type User = { profile: { name: string } }
 * type NameType = PathValue<User, "profile.name"> // string
 */
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never
