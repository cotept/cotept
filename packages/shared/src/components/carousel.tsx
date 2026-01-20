"use client"

import { Button } from "@repo/shared/components/button"
import { cn } from "@repo/shared/lib/utils"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  /**
   * Embla Carousel 옵션
   *
   * @property {boolean} [active=true] - 캐로셀 활성화/비활성화 (breakpoints와 함께 유용)
   * @property {string | function} [align='center'] - 슬라이드 정렬 ('start', 'center', 'end' 또는 커스텀 함수)
   * @property {string} [axis='x'] - 스크롤 방향 ('x': 가로, 'y': 세로)
   * @property {object} [breakpoints={}] - 미디어 쿼리 기반 옵션 오버라이드
   * @property {string | HTMLElement | null} [container=null] - 커스텀 컨테이너 요소 선택자
   * @property {false | string} [containScroll='trimSnaps'] - 빈 공간 처리 ('trimSnaps' 또는 'keepSnaps')
   * @property {string} [direction='ltr'] - 콘텐츠 방향 ('ltr' 또는 'rtl')
   * @property {boolean} [dragFree=false] - 드래그 후 관성 스크롤 활성화
   * @property {number} [dragThreshold=10] - 드래그 인식 최소 픽셀 거리
   * @property {number} [duration=25] - 스크롤 속도 (20-60 권장, **밀리초 아님 - 물리 시뮬레이션 값**)
   * @property {number} [inViewThreshold=0] - IntersectionObserver threshold (슬라이드 가시성 판단)
   * @property {boolean} [loop=false] - 무한 루프 캐로셀 활성화
   * @property {boolean} [skipSnaps=false] - 빠른 드래그 시 스냅 건너뛰기 허용
   * @property {string | HTMLElement[] | NodeList} [slides=null] - 커스텀 슬라이드 요소 선택자
   * @property {string | number} [slidesToScroll=1] - 슬라이드 그룹핑 ('auto' 자동 또는 정수)
   * @property {number} [startIndex=0] - 초기 시작 슬라이드 인덱스
   * @property {boolean | function} [watchDrag=true] - 마우스/터치 인터랙션 제어
   * @property {boolean | function} [watchFocus=true] - 슬라이드 포커스 이벤트 처리
   * @property {boolean | function} [watchResize=true] - 크기 변경 시 자동 재초기화
   * @property {boolean | function} [watchSlides=true] - 슬라이드 DOM 변경 시 자동 재초기화
   *
   * @see {@link https://www.embla-carousel.com/api/options/ Embla Carousel Options 공식 문서}
   *
   * @example
   * ```tsx
   * <Carousel
   *   opts={{
   *     align: "start",
   *     loop: true,
   *     duration: 30,
   *   }}
   * >
   *   <CarouselContent>
   *     <CarouselItem>슬라이드 1</CarouselItem>
   *     <CarouselItem>슬라이드 2</CarouselItem>
   *   </CarouselContent>
   * </Carousel>
   * ```
   */
  opts?: CarouselOptions
  /**
   * Embla Carousel 플러그인 (예: Autoplay)
   *
   * @example
   * ```tsx
   * import Autoplay from "embla-carousel-autoplay"
   *
   * const plugin = useRef(Autoplay({ delay: 5000 }))
   *
   * <Carousel plugins={[plugin.current]}>
   *   ...
   * </Carousel>
   * ```
   */
  plugins?: CarouselPlugin
  /**
   * 캐로셀 방향 ('horizontal' 또는 'vertical')
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Carousel API 인스턴스를 받는 콜백
   * API를 통해 프로그래밍 방식으로 캐로셀 제어 가능
   */
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext],
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel }
