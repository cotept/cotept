import Link from "next/link"

import { Button } from "@repo/shared/components/button"

export default function NotFound() {
  return (
    <div className="animate-in fade-in zoom-in flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center duration-500">
      <div className="max-w-md space-y-6">
        <h1 className="text-primary/90 select-none text-9xl font-black">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">페이지를 찾을 수 없어요</h2>
          <span className="text-muted-foreground">요청하신 페이지가 존재하지 않습니다.</span>
        </div>
        <div className="pt-4">
          <Button asChild size="lg" variant="default">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
