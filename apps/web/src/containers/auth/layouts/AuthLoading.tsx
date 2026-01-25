import { LoadingSpinner } from "@/shared/ui/loading"

interface AuthLoadingProps {
  message?: string
}

export function AuthLoading({ message = "인증을 처리하고 있습니다..." }: AuthLoadingProps) {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center transition-colors">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
