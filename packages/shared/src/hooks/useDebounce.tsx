import { DebouncedFunction } from "@repo/shared/types/types"
import { useCallback, useEffect, useRef, useState } from "react"

export interface DebounceOptions {
  /** 첫 번째 호출을 즉시 실행할지 여부 (기본: false) */
  leading?: boolean
  /** 마지막 호출을 지연 후 실행할지 여부 (기본: true) */
  trailing?: boolean
}

/**
 * CotePT 전용 디바운스 훅
 *
 * @param callback 디바운스를 적용할 함수
 * @param delay 지연 시간(ms)
 * @param options 디바운스 옵션
 * @returns 디바운스된 함수와 제어 메서드들
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce((query: string) => {
 *   console.log('검색:', query)
 * }, 300)
 *
 * // 사용
 * debouncedSearch('검색어')
 * debouncedSearch.cancel() // 취소
 * debouncedSearch.flush()  // 즉시 실행
 * ```
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  const { leading = false, trailing = true } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const argsRef = useRef<Parameters<T> | null>(null)
  const leadingCalledRef = useRef(false)

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    argsRef.current = null
    leadingCalledRef.current = false
  }, [])

  const flush = useCallback(() => {
    if (argsRef.current && timeoutRef.current) {
      callback(...argsRef.current)
      cancel()
    }
  }, [callback, cancel])

  const isPending = useCallback(() => {
    return timeoutRef.current !== null
  }, [])

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args

      // Leading edge 처리
      if (leading && !leadingCalledRef.current && !timeoutRef.current) {
        callback(...args)
        leadingCalledRef.current = true
      }

      // 기존 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Trailing edge 처리
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callback(...args)
          timeoutRef.current = null
          argsRef.current = null
          leadingCalledRef.current = false
        }, delay)
      } else {
        // trailing이 false면 타이머만 설정하고 실행하지 않음
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null
          argsRef.current = null
          leadingCalledRef.current = false
        }, delay)
      }
    },
    [callback, delay, leading, trailing],
  )

  // 컴포넌트 언마운트 시 정리
  const cancel_ = useCallback(() => {
    cancel()
  }, [cancel])

  // 메서드들을 함수에 추가
  const result = debouncedFunction as DebouncedFunction<T>
  result.cancel = cancel_
  result.flush = flush
  result.isPending = isPending

  return result
}

/**
 * 값에 대한 디바운스 훅 (useDebounce의 간편 버전)
 *
 * @param value 디바운스를 적용할 값
 * @param delay 지연 시간(ms)
 * @returns 디바운스된 값
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounceValue(searchTerm, 300)
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // API 호출
 *   }
 * }, [debouncedSearchTerm])
 * ```
 */
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
