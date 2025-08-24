"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"

import { Eye, EyeOff } from "lucide-react"

import { usePasswordStep } from "@/features/auth/hooks/signup/usePasswordStep"
import { PasswordStepData } from "@/features/auth/lib/validations/auth-rules"

interface PasswordStepProps {
  onComplete: (data: PasswordStepData) => void
}

const PasswordStep: React.FC<PasswordStepProps> = ({ onComplete }) => {
  const { form, handleSubmit, passwordChecks, showPassword, togglePasswordVisibility } = usePasswordStep({
    onComplete,
  })

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 상단 로고 영역 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          COTEPT
        </h1>
      </div>

      {/* 메인 카드 */}
      <div className="bg-zinc-800/50 rounded-xl p-8 space-y-6 border border-zinc-700/50">
        {/* 제목 */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">비밀번호 설정</h2>
          <p className="text-sm text-zinc-400">안전한 비밀번호를 설정해주세요</p>
        </div>

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
                        className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-purple-400 pr-10"
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

            {/* 비밀번호 조건 표시 - 2줄 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${passwordChecks.lengthValid ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-sm ${passwordChecks.lengthValid ? "text-green-400" : "text-red-400"}`}>
                  8자 이상 32자 이하
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${passwordChecks.compositionValid ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className={`text-sm ${passwordChecks.compositionValid ? "text-green-400" : "text-red-400"}`}>
                  영문, 숫자, 특수문자 포함
                </span>
              </div>
            </div>

            {/* 비밀번호 확인 입력 */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-purple-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={!passwordChecks.lengthValid || !passwordChecks.compositionValid}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white disabled:bg-zinc-800 disabled:text-zinc-500 h-12">
              다음
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default PasswordStep
