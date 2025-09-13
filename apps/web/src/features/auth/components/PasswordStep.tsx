"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"
import { ValidationIndicator } from "@repo/shared/src/components/validation-indicator"

import { Eye, EyeOff } from "lucide-react"

import { usePasswordStep } from "@/features/auth/hooks/signup/usePasswordStep"
import { PasswordStepData } from "@/features/auth/lib/validations/auth-rules"

interface PasswordStepProps {
  onComplete: (data: PasswordStepData) => void
}

const PasswordStep: React.FC<PasswordStepProps> = ({ onComplete }) => {
  const {
    form,
    password,
    handleSubmit,
    passwordChecks,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    passwordsMatch: isPasswordMatched,
    validationChecks,
  } = usePasswordStep({
    onComplete,
  })

  const { isDirty } = form.formState

  return (
    <>
      {/* 폼 */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 비밀번호 입력 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">비밀번호</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      className="border-zinc-600 bg-zinc-700/50 pr-10 text-white placeholder:text-zinc-400 focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 비밀번호 조건 표시 - isDirty 기반 부드러운 색상 전환 */}
          <ValidationIndicator checks={validationChecks} showWhen="always" inputValue={password} isDirty={isDirty} />

          {/* 비밀번호 확인 입력 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">비밀번호 확인</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      className="border-zinc-600 bg-zinc-700/50 text-white placeholder:text-zinc-400 focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                      aria-label={showConfirmPassword ? "비밀번호 확인 숨기기" : "비밀번호 확인 보기"}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 제출 버튼 */}
          <Button
            type="submit"
            variant={!isPasswordMatched ? "ghost" : "auth-primary"}
            disabled={!passwordChecks.lengthValid || !passwordChecks.compositionValid}
            className="h-12 w-full">
            다음
          </Button>
        </form>
      </Form>
    </>
  )
}

export default PasswordStep
