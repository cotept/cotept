"use client"

import { Button } from "@repo/shared/components/button"
import { Input } from "@repo/shared/components/input"
import { cn } from "@repo/shared/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"

import { CircleX, Eye, EyeOff } from "lucide-react"

import { useSignIn } from "../../hooks/signin/useSignIn"

import { InlineLoading } from "@/shared/ui/loading/LoadingSpinner"

export function SignInForm() {
  const {
    form,
    id,
    handleSubmit,
    errors,
    isLoading,
    showPassword,
    togglePasswordVisibility,
    isIdValid,
    isPasswordValid,
    showPasswordField,
    handleShowPasswordField,
    clearIdField,
  } = useSignIn()
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-auth-gap">
        <div className="h-50 flex flex-col gap-7">
          {/* 이메일 입력 필드 */}
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-zinc-300">아이디</FormLabel>
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
                        "h-auth-input w-full rounded-lg",
                        "bg-auth-input text-white",
                        "placeholder:text-sm placeholder:text-zinc-500",
                        "focus:border-b-2 focus:border-b-purple-500",
                        "transition-colors duration-200",
                        errors.id && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                      )}
                      disabled={isLoading}
                    />
                    {id && (
                      <button
                        type="button"
                        onClick={clearIdField}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-300"
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
          {showPasswordField && isIdValid && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-zinc-300">비밀번호</FormLabel>
                  <FormControl className="relative">
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="비밀번호를 입력해주세요"
                        autoFocus
                        autoComplete="off"
                        className={cn(
                          "h-auth-input w-full rounded-lg pr-12",
                          "bg-auth-input text-white",
                          "placeholder:text-sm placeholder:text-zinc-500",
                          "focus:border-b-2 focus:border-b-purple-500",
                          "transition-colors duration-200",
                          errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        )}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-300"
                        disabled={isLoading}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* 에러 메시지 */}
        {errors.root && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{errors.root?.message}</p>
          </div>
        )}

        {/* 도움말 링크 */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-300">
            로그인에 어려움을 겪고 계신가요?
          </button>
        </div>

        {/* 다음 버튼 */}
        {!showPasswordField && (
          <Button
            variant="auth-primary"
            size="xl"
            className="h-auth-button w-full rounded-lg font-medium"
            onClick={handleShowPasswordField}
            disabled={isLoading}>
            {isLoading ? <InlineLoading /> : "다음"}
          </Button>
        )}

        {/* 로그인 버튼 */}
        {showPasswordField && (
          <Button
            type="submit"
            variant={isIdValid && isPasswordValid ? "auth-special" : "outline"}
            size="xl"
            className="h-auth-button w-full rounded-lg font-medium"
            disabled={isLoading}>
            {isLoading ? <InlineLoading /> : "로그인"}
          </Button>
        )}
      </form>
    </Form>
  )
}
