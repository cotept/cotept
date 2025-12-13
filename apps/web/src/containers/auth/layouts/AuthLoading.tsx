import { LoadingSpinner } from "@/shared/ui/loading"

interface AuthLoadingProps {
  message?: string
}

export function AuthLoading({ message = "인증을 처리하고 있습니다..." }: AuthLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
