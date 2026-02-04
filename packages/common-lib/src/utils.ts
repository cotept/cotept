/**
 * @file utils.ts
 * @description 순수 유틸리티 함수 (의존성 없음)
 */

import { DebouncedFunction, DeepPartial, JSONValue, PathsToProps, PathValue } from "./types"

/** - - - - - - - - - - - - - - - - -
 * 객체 메소드
 *- - - - - - - - - - - - - - - - -*/

//  Type-Safe Object.keys
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

//  Type-Safe Object.entries
export function typedEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}
//  Type-Safe Object.values
export function typedValues<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][]
}

//  Type-Safe Object.fromEntries
export function typedFromEntries<K extends string | number | symbol, V>(entries: [K, V][]): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}
// Type-Safe Object transform (map)
export function mapObject<T extends object, U>(
  obj: T,
  fn: <K extends keyof T>(key: K, value: T[K]) => U,
): Record<keyof T, U> {
  return typedFromEntries(typedEntries(obj).map(([key, value]) => [key, fn(key, value)]))
}

// pickBy (조건부 속성 선택)
export function pickBy<T extends object>(
  obj: T,
  predicate: <K extends keyof T>(key: K, value: T[K]) => boolean,
): Partial<T> {
  return typedFromEntries(typedEntries(obj).filter(([key, value]) => predicate(key, value))) as Partial<T>
}

//omitBy (조건부 속성 제거)
export function omitBy<T extends object>(
  obj: T,
  predicate: <K extends keyof T>(key: K, value: T[K]) => boolean,
): Partial<T> {
  return typedFromEntries(typedEntries(obj).filter(([key, value]) => !predicate(key, value))) as Partial<T>
}

/** - - - - - - - - - - - - - - - - -
 * 객체 병합 (Deep)
 *- - - - - - - - - - - - - - - - -*/

export function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const output = { ...target } as any

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = (source as any)[key]
      const targetValue = (target as any)[key]

      if (isObject(sourceValue) && isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        output[key] = sourceValue
      }
    })
  }

  return output
}

function isObject(item: any): item is object {
  return item && typeof item === "object" && !Array.isArray(item)
}

/** - - - - - - - - - - - - - - - - -
 * 중첩 객체 경로 접근
 *- - - - - - - - - - - - - - - - -*/

export function getByPath<T extends object, P extends PathsToProps<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return (path as string).split(".").reduce((acc: any, key) => acc?.[key], obj) as any
}

export function setByPath<T extends object, P extends PathsToProps<T>>(obj: T, path: P, value: PathValue<T, P>): T {
  const keys = (path as string).split(".")
  const lastKey = keys.pop()!
  const target = keys.reduce((acc: any, key) => {
    if (!acc[key]) acc[key] = {}
    return acc[key]
  }, obj as any)

  target[lastKey] = value
  return obj
}

export function getAllPaths<T extends object>(obj: T, prefix: string = ""): PathsToProps<T>[] {
  const paths: string[] = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key
      paths.push(currentPath)

      const value = obj[key]
      if (value && typeof value === "object" && !Array.isArray(value)) {
        paths.push(...getAllPaths(value, currentPath))
      }
    }
  }

  return paths as PathsToProps<T>[]
}

export function findPathToKey<T extends object>(obj: T, targetKey: string, prefix: string = ""): string | null {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key

      if (key === targetKey) {
        return currentPath
      }

      const value = obj[key]
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const found = findPathToKey(value, targetKey, currentPath)
        if (found) return found
      }
    }
  }

  return null
}

export function findAllPathsToKey<T extends object>(obj: T, targetKey: string, prefix: string = ""): string[] {
  const paths: string[] = []

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key

      if (key === targetKey) {
        paths.push(currentPath)
      }

      const value = obj[key]
      if (value && typeof value === "object" && !Array.isArray(value)) {
        paths.push(...findAllPathsToKey(value, targetKey, currentPath))
      }
    }
  }

  return paths
}

export function findPathByValue<T extends object>(obj: T, targetValue: any, prefix: string = ""): string | null {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      if (value === targetValue) {
        return currentPath
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        const found = findPathByValue(value, targetValue, currentPath)
        if (found) return found
      }
    }
  }

  return null
}

/** - - - - - - - - - - - - - - - - -
 * 배열 메소드
 *- - - - - - - - - - - - - - - - -*/

export function mapWithType<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  return arr.map(fn)
}

export function filterNotNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== null && item !== undefined)
}

export function groupBy<T, K extends string | number | symbol>(arr: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  return arr.reduce(
    ([pass, fail], item) => {
      return predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]]
    },
    [[], []] as [T[], T[]],
  )
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {
  const seen = new Map<K, T>()
  arr.forEach((item) => {
    const key = keyFn(item)
    if (!seen.has(key)) seen.set(key, item)
  })
  return Array.from(seen.values())
}

export function filterWithType<T, S extends T>(arr: T[], guard: (item: T) => item is S): S[] {
  return arr.filter(guard)
}

/** - - - - - - - - - - - - - - - - -
 * JSON
 *- - - - - - - - - - - - - - - - -*/

export function safeJsonParse<T extends JSONValue>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/** - - - - - - - - - - - - - - - - -
 * 이벤트 제어
 *- - - - - - - - - - - - - - - - -*/

export function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
      lastArgs = null
    }, delayMs)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      lastArgs = null
    }
  }

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId)
      fn(...lastArgs)
      timeoutId = null
      lastArgs = null
    }
  }

  return debounced as DebouncedFunction<T>
}

export function throttle<T extends (...args: any[]) => any>(fn: T, intervalMs: number): DebouncedFunction<T> {
  let lastCall = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    const execute = () => {
      lastCall = now
      fn(...args)
    }

    if (timeSinceLastCall >= intervalMs) {
      execute()
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(execute, intervalMs - timeSinceLastCall)
    }
  }

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  throttled.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      fn()
      timeoutId = null
    }
  }

  return throttled as DebouncedFunction<T>
}

/**
 * Promise 타임아웃
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Timeout exceeded",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ])
}

/**
 * 재시도 로직 (Exponential Backoff)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: number
    onRetry?: (error: Error, attempt: number) => void
  } = {},
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2, onRetry } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1)
        onRetry?.(lastError, attempt)
        await sleep(waitTime)
      }
    }
  }

  throw lastError!
}

/**
 * Promise 기반 sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Promise 배열을 순차적으로 실행 (병렬 아님)
 */
export async function runSequentially<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = []

  for (const task of tasks) {
    results.push(await task())
  }

  return results
}

/**
 * Promise 배열을 청크 단위로 병렬 실행
 */
export async function runInChunks<T>(tasks: (() => Promise<T>)[], chunkSize: number): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < tasks.length; i += chunkSize) {
    const chunk = tasks.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(chunk.map((task) => task()))
    results.push(...chunkResults)
  }

  return results
}

/**
 * 빈 값 체크
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "object") return Object.keys(value).length === 0
  return false
}
