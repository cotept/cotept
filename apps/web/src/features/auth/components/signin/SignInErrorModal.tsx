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
    <dialog open={isOpen} onClose={onClose} className="max-w-sm">
      <div className="p-auth-padding space-y-auth-container text-center">
        {/* 에러 아이콘 */}
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>

          {/* 에러 메시지 */}
          <p className="text-sm leading-relaxed text-zinc-300">{message}</p>
        </div>

        {/* 확인 버튼 */}
        <Button variant="auth-primary" size="xl" className="h-auth-button w-full" onClick={onClose}>
          확인
        </Button>
      </div>
    </dialog>
  )
}
