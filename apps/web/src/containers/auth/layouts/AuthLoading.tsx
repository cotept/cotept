import { LoadingSpinner } from "@/shared/ui/loading"

interface AuthLoadingProps {
  message?: string
}

export function AuthLoading({ message = "인증을 처리하고 있습니다..." }: AuthLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
