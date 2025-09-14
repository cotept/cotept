import { SignInForm } from "@/features/auth/components/signin/SignInForm"

export function SignInContainer() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* COTEPT 로고 */}
        <h1 className="mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-center text-4xl font-bold text-transparent">
          COTEPT
        </h1>

        {/* 로그인 카드 */}
        <div className="space-y-auth-container border-auth-border bg-auth-surface p-auth-padding rounded-xl border">
          {/* 페이지 제목 */}
          <div className="mb-auth-gap text-left">
            <h2 className="mb-2 text-base font-semibold text-zinc-300">로그인</h2>
          </div>

          {/* 로그인 폼 */}
          <SignInForm />
        </div>

        {/* 에러 모달 */}
        {/* <SignInErrorModal isOpen={!!error} onClose={clearError} message={error || ""} /> */}
      </div>
    </div>
  )
}
