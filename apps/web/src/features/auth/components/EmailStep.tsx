"use client"

import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"

import { useEmailStep } from "@/features/auth/hooks/signup/useEmailStep"
import { EmailStepData } from "@/features/auth/lib/validations/auth-rules"

interface EmailStepProps {
  onComplete: (data: EmailStepData) => void
}

const EmailStep: React.FC<EmailStepProps> = ({ onComplete }) => {
  const { form, handleSubmit, isLoading, isEmailValid } = useEmailStep({ onComplete })

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
          <h2 className="text-xl font-semibold text-white">이메일로 시작</h2>
        </div>

        {/* 폼 */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">이메일</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="이메일을 입력하세요"
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
              disabled={!isEmailValid || isLoading}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white disabled:bg-zinc-800 disabled:text-zinc-500 h-12">
              {isLoading ? "확인 중..." : "다음"}
            </Button>
          </form>
        </Form>

        {/* 하단 로그인 링크 */}
        <div className="text-center pt-4 border-t border-zinc-700">
          <p className="text-sm text-zinc-400">
            로그인은 여기를 눌러 계속하고 계신가요?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailStep
