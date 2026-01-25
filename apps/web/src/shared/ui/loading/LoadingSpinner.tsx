import { Spinner } from "@repo/shared/components/spinner"
import { cn } from "@repo/shared/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

export function LoadingSpinner({ size = "md", className, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <Spinner className={sizeClasses[size]} />
      {message && <p className="text-center text-sm text-gray-600">{message}</p>}
    </div>
  )
}

// 전체 페이지 로딩 스피너
export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}

// 인라인 로딩 스피너 (버튼 내부 등에서 사용)
export function InlineLoading({ className }: { className?: string }) {
  return <Spinner className={cn("size-4", className)} />
}
