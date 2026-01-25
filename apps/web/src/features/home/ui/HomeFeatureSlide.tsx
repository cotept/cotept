import { Button } from "@repo/shared/components/button"
import { CodeEditor } from "@repo/shared/components/code-editor"

import { CircleCheck } from "lucide-react"

const CODE_EXAMPLE = `function solve(problem) {
  const solution = new Set();
  // 실시간 피드백 진행중...
  return solution;
}`

/**
 * 홈 기능 소개 슬라이드 (Server Component)
 * 실시간 1:1 멘토링 기능과 코드 에디터 미리보기
 */
export async function HomeFeatureSlide() {
  return (
    <section className="bg-linear-to-br from-tertiary/5 via-background to-primary/5 relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden rounded-2xl p-6 sm:gap-12 sm:p-8 lg:flex-row lg:gap-16 lg:p-12">
      {/* 왼쪽: 텍스트 콘텐츠 */}
      <div className="flex-1 space-y-6 sm:space-y-8">
        <div>
          <h1 className="bg-linear-to-r from-tertiary to-primary mb-1 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
            실시간 1:1 멘토링
          </h1>
          <h2 className="text-foreground text-2xl font-bold sm:text-3xl lg:text-4xl">효율적인 성장을 경험하세요.</h2>
        </div>

        <p className="text-muted-foreground max-w-xl text-base font-medium leading-relaxed sm:text-lg">
          코드 리뷰부터 커리어 상담까지, 당신의 성장을 위한 최고의 멘토를 만나보세요.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <Button variant="cta-primary" size="2xl" className="rounded-lg font-bold">
            지금 멘토 찾기
          </Button>
          <Button variant="outline" size="2xl" className="rounded-lg font-bold">
            멘토 등록하기
          </Button>
        </div>

        {/* 기능 체크리스트 */}
        <div className="flex flex-wrap items-center gap-4 pt-2 sm:gap-6 sm:pt-4">
          {["검증된 현직 멘토", "1:1 맞춤형 피드백", "실시간 코드 리뷰"].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CircleCheck className="fill-primary text-primary-foreground h-4 w-4 font-semibold sm:h-5 sm:w-5" />
              <span className="text-foreground text-sm font-medium sm:text-base">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 코드 에디터 목업 */}
      <div className="relative hidden w-full flex-1 lg:block lg:w-auto">
        <CodeEditor
          code={CODE_EXAMPLE}
          language="javascript"
          theme="vitesse-dark"
          variant="default"
          showHeader
          showLineNumbers
          rounded="xl"
          className="shadow-2xl"
        />
      </div>

      {/* 장식용 그라데이션 블롭 */}
      <div className="bg-tertiary/20 pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64" />
      <div className="bg-primary/20 pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full blur-3xl sm:h-64 sm:w-64" />
    </section>
  )
}
