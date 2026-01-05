import { useIsClient, useMediaQuery } from "@uidotdev/usehooks"

/**
 * 뷰포트 크기 범위 상수
 * Tailwind CSS의 기본 breakpoint와 동기화 필요
 */
export const BREAKPOINTS = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1024 },
  desktop: { min: 1025, max: 1919 }, // Full HD 기준으로 조정
  desktopLarge: { min: 1920 }, // Full HD 이상
} as const

/**
 * 뷰포트 크기 정보
 */
export interface ViewportSize {
  /** 모바일 뷰포트 (≤ 767px) */
  isMobile: boolean
  /** 태블릿 뷰포트 (768px ~ 1024px) */
  isTablet: boolean
  /** 데스크탑 뷰포트 (1025px ~ 1919px) */
  isDesktop: boolean
  /** 대형 데스크탑 뷰포트 (≥ 1920px) */
  isDesktopLarge: boolean
  /** Tailwind lg: 브레이크포인트와 일치 (≥ 1024px) - Sheet 등 JS 제어용 */
  isLgUp: boolean
  /** 현재 활성화된 breakpoint 키 */
  current: "mobile" | "tablet" | "desktop" | "desktopLarge"
}

/**
 * 현재 뷰포트의 크기 범위를 감지하는 훅
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const { isMobile, current } = useViewportSize()
 *
 *   if (isMobile) {
 *     return <MobileLayout />
 *   }
 *   return <DesktopLayout />
 * }
 * ```
 *
 * @remarks
 * - SSR 환경에서는 기본값(desktop)을 반환합니다
 * - 클라이언트 hydration 이후 실제 뷰포트 크기로 업데이트됩니다
 * - Tailwind CSS breakpoint와 일치시켜야 합니다
 */
const useViewportSize = (): ViewportSize => {
  const isClient = useIsClient()

  const isMobile = useMediaQuery(`only screen and (max-width: ${BREAKPOINTS.mobile.max}px)`)
  const isTablet = useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`
  )
  const isDesktop = useMediaQuery(
    `only screen and (min-width: ${BREAKPOINTS.desktop.min}px) and (max-width: ${BREAKPOINTS.desktop.max}px)`
  )
  const isDesktopLarge = useMediaQuery(`only screen and (min-width: ${BREAKPOINTS.desktopLarge.min}px)`)

  // Tailwind lg: 브레이크포인트와 정확히 일치 (1024px 이상)
  const isLgUp = useMediaQuery("only screen and (min-width: 1024px)")

  // SSR 중에는 안전한 기본값 반환
  if (!isClient) {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isDesktopLarge: false,
      isLgUp: true, // SSR 시 데스크탑으로 가정
      current: "desktop",
    }
  }

  // 현재 활성화된 breakpoint 결정
  let current: ViewportSize["current"] = "desktop"
  if (isMobile) current = "mobile"
  else if (isTablet) current = "tablet"
  else if (isDesktopLarge) current = "desktopLarge"

  return { isMobile, isTablet, isDesktop, isDesktopLarge, isLgUp, current }
}

export default useViewportSize
