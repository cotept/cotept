import { useEffect, useRef, useState } from "react"

/**
 * 만료 시간까지 카운트다운 커스텀 훅
 *
 * ★ Insight:
 * - ISO 8601 날짜 문자열을 받아 남은 시간을 초 단위로 반환
 * - 1초마다 자동으로 업데이트
 * - 만료 시 콜백 실행 및 타이머 정리
 * - 재사용 가능: OTP, 세션 타임아웃, 임시 링크 등
 *
 * @param expiresAt ISO 8601 형식의 만료 시간 (예: "2024-01-01T12:00:00Z")
 * @param onExpire 만료 시 실행할 콜백 함수
 * @returns 남은 시간 (초 단위)
 *
 * @example
 * ```tsx
 * const timeRemaining = useCountdown(expiresAt, () => {
 *   toast.error("인증 시간이 만료되었습니다")
 *   setIsExpired(true)
 * })
 *
 * return <div>남은 시간: {formatTimeMMSS(timeRemaining)}</div>
 * ```
 */
export function useCountdown(expiresAt: string | null, onExpire?: () => void): number {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // onExpire 콜백을 useRef로 저장하여 무한 루프 방지
  const onExpireRef = useRef(onExpire)

  // onExpire가 변경될 때마다 ref 업데이트 (의존성 배열에서 제외)
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // 만료 플래그 (중복 실행 방지)
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    // 만료 시간이 없으면 타이머 미실행
    if (!expiresAt) {
      setTimeRemaining(0)
      hasExpiredRef.current = false
      return
    }

    // expiresAt 변경 시 만료 플래그 리셋
    hasExpiredRef.current = false

    // 초기 남은 시간 계산
    const calculateTimeRemaining = (): number => {
      const now = new Date().getTime()
      const expires = new Date(expiresAt).getTime()
      const diff = expires - now

      return diff > 0 ? Math.floor(diff / 1000) : 0
    }

    // 초기값 설정
    const initialTime = calculateTimeRemaining()
    setTimeRemaining(initialTime)

    // 이미 만료된 경우 (중복 실행 방지)
    if (initialTime <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true
      onExpireRef.current?.()
      return
    }

    // 1초마다 업데이트
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      // 만료 시 콜백 실행 및 타이머 정리 (중복 실행 방지)
      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        clearInterval(interval)
        onExpireRef.current?.()
      }
    }, 1000)

    // 클린업: 컴포넌트 언마운트 또는 expiresAt 변경 시
    return () => {
      clearInterval(interval)
    }
  }, [expiresAt]) // onExpire 제거!

  return timeRemaining
}

/**
 * 시간(초)을 MM:SS 형식으로 포맷팅
 *
 * @param seconds 초 단위 시간
 * @returns MM:SS 형식 문자열
 *
 * @example
 * formatCountdownTime(125) // => "02:05"
 * formatCountdownTime(59)  // => "00:59"
 */
export function formatCountdownTime(seconds: number): string {
  if (seconds <= 0) return "00:00"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}
