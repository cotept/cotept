"use client"

import React from "react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/shared/components/carousel"

import Autoplay from "embla-carousel-autoplay"

interface HomeCarouselProps {
  children: React.ReactNode
}

/**
 * 홈 화면 캐로셀 컴포넌트
 * children으로 슬라이드 콘텐츠를 받아 자동 재생 캐로셀로 렌더링
 *
 * @example
 * ```tsx
 * <HomeCarousel>
 *   <HomeHeroSlide />
 *   <HomeFeatureSlide />
 * </HomeCarousel>
 * ```
 */
export function HomeCarousel({ children }: HomeCarouselProps) {
  const plugin = React.useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))

  // children을 배열로 변환하여 각각 CarouselItem으로 래핑
  const slides = React.Children.toArray(children)

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        duration: 30,
      }}
      plugins={[plugin.current]}
      className="w-full">
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem
            key={index}
            className="min-h-carousel-height-sm sm:min-h-carousel-height-md lg:min-h-carousel-height-lg">
            {slide}
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Navigation Buttons */}
      <CarouselPrevious className="left-2 sm:left-4 lg:-left-12" />
      <CarouselNext className="right-2 sm:right-4 lg:-right-12" />
    </Carousel>
  )
}
