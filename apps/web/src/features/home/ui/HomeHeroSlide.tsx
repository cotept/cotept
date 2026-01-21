import { Button } from "@repo/shared/components/button"

import { GraduationCap, Search } from "lucide-react"

/**
 * 홈 히어로 슬라이드 (Server Component)
 * 멘토링 플랫폼의 메인 메시지와 CTA 버튼
 */
export function HomeHeroSlide() {
  return (
    <section className="bg-linear-to-br from-primary/5 via-background to-secondary/5 relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-12 sm:py-24 lg:px-16 lg:py-28">
      {/* 타이틀 */}
      <h1 className="text-foreground mx-auto mb-6 max-w-4xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
        업계 선배 혹은 미래의 동료들과
        <br />
        <span className="bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
          인사이트
        </span>
        를 나눠 보세요.
      </h1>

      {/* 설명 */}
      <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed sm:text-lg">
        더 빨리, 더 멀리 갈 수 있어요 혼자 고민하지 마세요!
      </p>

      {/* CTA 버튼 */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Button variant="auth-special" size="2xl" className="rounded-lg font-bold">
          <GraduationCap className="h-4 w-4 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
          멘토 지원하기
        </Button>
        <Button variant="outline" size="2xl" className="rounded-lg font-bold">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          멘토링 후기 보기
        </Button>
      </div>

      {/* 장식용 그라데이션 블롭 */}
      <div className="bg-primary/20 pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64" />
      <div className="bg-secondary/20 pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64" />
    </section>
  )
}
