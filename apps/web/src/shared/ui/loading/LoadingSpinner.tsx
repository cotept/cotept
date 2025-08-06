import { cn } from "@repo/shared/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  message?: string
}

export function LoadingSpinner({ size = "md", className, message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size])} />
      {message && <p className="text-sm text-gray-600 text-center">{message}</p>}
    </div>
  )
}

// 전체 페이지 로딩 스피너
export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}

// 인라인 로딩 스피너 (버튼 내부 등에서 사용)
export function InlineLoading({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-current" />
    </div>
  )
}
