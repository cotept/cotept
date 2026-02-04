import { Metadata } from "next"
import Link from "next/link"

import { Button } from "@repo/shared/components/button"

export const metadata: Metadata = {
  title: "Error | CotePT",
  description: "접근 중 오류가 발생했습니다.",
}

interface ErrorPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * @file page.tsx
 * @description 인증 및 인가 오류를 표시하는 공통 에러 페이지
 */
export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const { code } = await searchParams
  const isForbidden = code === "forbidden"

  return (
    <div className="animate-in fade-in zoom-in flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center duration-500">
      <div className="max-w-md space-y-6">
        {/* 에러 코드 표시 */}
        <h1 className="text-primary/90 select-none text-9xl font-black">{isForbidden ? "403" : "Error"}</h1>

        <div className="space-y-2">
          {/* 에러 제목 */}
          <h2 className="text-3xl font-bold tracking-tight">
            {isForbidden ? "접근 권한이 없어요" : "오류가 발생했습니다"}
          </h2>

          {/* 에러 설명 */}
          <p className="text-muted-foreground whitespace-pre-line">
            {isForbidden
              ? "이 페이지에 접근할 수 있는 권한이 없습니다.\n관리자에게 문의하시거나 권한이 있는 계정으로 다시 로그인해주세요."
              : "요청을 처리하는 중에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요."}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col justify-center gap-2 pt-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/main">홈으로 돌아가기</Link>
          </Button>
          {isForbidden && (
            <Button asChild variant="default">
              <Link href="/auth/signin">다른 계정으로 로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
