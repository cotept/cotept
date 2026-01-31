"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@repo/shared/components/button"
import { Input } from "@repo/shared/components/input"
import { cn } from "@repo/shared/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import FormStepContent from "@repo/shared/src/components/form-step-content"
import StepFlowLayout from "@repo/shared/src/components/step-flow-layout"

import { CircleX, Eye, EyeOff } from "lucide-react"

import { useSignIn } from "../../hooks/signin/useSignIn"

import { InlineLoading } from "@/shared/ui/loading/LoadingSpinner"
import Logo from "@/shared/ui/Logo"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const {
    form,
    id,
    password,
    handleSubmit,
    errors,
    isLoading,
    showPassword,
    togglePasswordVisibility,
    isIdValid,
    isPasswordValid,
    clearIdField,
  } = useSignIn({
    onSuccess: () => router.push(callbackUrl),
  })
  return (
    <StepFlowLayout className="space-y-8">
      <div className="flex flex-col items-center justify-between gap-2 space-y-2 text-center">
        <Link href="/" className="group flex cursor-pointer items-center justify-start gap-2">
          <Logo size={"lg"} variant={"primary"} margin={false} className="w-full" />
        </Link>
        <span className="text-muted-foreground text-lg font-semibold">
          성장에 목마른 개발자들을 위한 실시간 1:1 멘토링
        </span>
      </div>
      <FormStepContent>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* 이메일 입력 필드 */}
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground text-xs font-semibold">아이디</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="text"
                          required
                          placeholder="아이디를 입력해주세요"
                          autoComplete="off"
                          autoFocus
                          className={cn(
                            "h-12 w-full rounded-lg px-4",
                            "border-input bg-bg-4/50 text-foreground border outline-none",
                            "transition-colors duration-200",
                            errors.id && "border-destructive focus:border-destructive focus:ring-destructive/20",
                          )}
                          disabled={isLoading}
                        />
                        {id && (
                          <button
                            type="button"
                            onClick={clearIdField}
                            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            disabled={!id}>
                            <CircleX size={20} />
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 비밀번호 입력 필드 */}
              {/* {showPasswordField && isIdValid && ( */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground text-sm font-semibold">
                      비밀번호
                      <Link
                        href="/auth/find-password"
                        className="text-primary hover:text-primary ml-auto text-xs font-medium hover:underline">
                        비밀번호를 잊으셨나요?
                      </Link>
                    </FormLabel>
                    <FormControl className="relative">
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="비밀번호를 입력해주세요"
                          autoComplete="off"
                          className={cn(
                            "h-12 w-full rounded-lg px-4",
                            "border-input bg-bg-4/50 text-foreground border outline-none",
                            "transition-colors duration-200",
                            errors.password &&
                              "border-destructive focus:border-destructive focus:ring-destructive-tint",
                          )}
                          disabled={isLoading}
                        />
                        {password && (
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            disabled={isLoading}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 에러 메시지 */}
              {errors.root && (
                <div className="border-destructive/20 bg-destructive/10 rounded-lg px-4 py-3">
                  <p className="text-destructive text-sm">{errors.root?.message}</p>
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                variant={"auth-primary"}
                size="xl"
                className="w-full rounded-lg font-bold"
                disabled={!(isIdValid && isPasswordValid) || isLoading}>
                {isLoading ? <InlineLoading /> : "로그인"}
              </Button>
            </div>
          </form>
        </Form>
        {/* 소셜 로그인 */}
        {/* <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="border-border w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-2">또는 소셜 계정으로 로그인</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg">
            구글
          </Button>
          <Button variant="outline" size="lg">
            깃허브
          </Button>
        </div> */}

        <p className="text-muted-foreground mt-8 text-center text-xs">
          아직 계정이 없으신가요?
          <Link
            href="signup"
            className="text-primary hover:text-primary ml-1 font-medium transition-colors hover:underline">
            회원가입
          </Link>
        </p>
      </FormStepContent>
    </StepFlowLayout>
  )
}
