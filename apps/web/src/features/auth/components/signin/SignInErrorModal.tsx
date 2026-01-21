"use client"

import { Button } from "@repo/shared/components/button"

import { AlertTriangle } from "lucide-react"

/**
 * 로그인 에러 모달 컴포넌트
 *
 * 기능:
 * - 로그인 실패 시 모달로 에러 메시지 표시
 * - Laftel 스타일 디자인 적용
 * - 디자인 토큰 활용
 */
interface SignInErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export function SignInErrorModal({
  isOpen,
  onClose,
  title = "다시 한번 확인해주세요.",
  message,
}: SignInErrorModalProps) {
  return (
    <dialog
      open={isOpen}
      onClose={onClose}
      className="bg-background border-border fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-0 shadow-xl backdrop:bg-black/80 backdrop:backdrop-blur-sm">
      <div className="space-y-6 p-7 text-center">
        {/* 에러 아이콘 */}
        <div className="flex justify-center">
          <div className="bg-destructive/10 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <h3 className="text-foreground text-lg font-semibold">{title}</h3>

          {/* 에러 메시지 */}
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
        </div>

        {/* 확인 버튼 */}
        <Button variant="auth-primary" size="xl" className="w-full" onClick={onClose}>
          확인
        </Button>
      </div>
    </dialog>
  )
}
