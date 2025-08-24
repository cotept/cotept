"use client"

import React from "react"

import { Button } from "@repo/shared/src/components/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/shared/src/components/form"
import { Input } from "@repo/shared/src/components/input"

import { Sparkles } from "lucide-react"

import { useProfileStep } from "@/features/auth/hooks/signup/useProfileStep"
import { ProfileStepData } from "@/features/auth/lib/validations/auth-rules"

interface ProfileStepProps {
  onComplete: (data: ProfileStepData) => void
}

const ProfileStep: React.FC<ProfileStepProps> = ({ onComplete }) => {
  const { form, handleSubmit, isLoading, isNicknameValid } = useProfileStep({ onComplete })

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
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">프로필 설정</h2>
          </div>
          <p className="text-sm text-zinc-400">거의 완료되었습니다!</p>
          <p className="text-xs text-zinc-500">마지막으로 닉네임을 설정해주세요</p>
        </div>

        {/* 폼 */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">닉네임</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="2-20자 사이의 닉네임을 입력하세요"
                      className="bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-purple-400"
                      maxLength={20}
                    />
                  </FormControl>
                  <FormMessage />

                  {/* 닉네임 길이 표시 */}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-zinc-500">한글, 영문, 숫자 사용 가능</p>
                    <p className="text-xs text-zinc-500">{field.value.length}/20</p>
                  </div>
                </FormItem>
              )}
            />

            {/* 완료 버튼 */}
            <Button
              type="submit"
              disabled={!isNicknameValid || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 h-12 font-semibold">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>확인 중...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>회원가입 완료</span>
                </div>
              )}
            </Button>
          </form>
        </Form>

        {/* 축하 메시지 */}
        <div className="text-center pt-4 border-t border-zinc-700">
          <p className="text-sm text-zinc-400">
            🎉 환영합니다! 곧 CotePT와 함께
            <br />
            코딩 테스트 실력을 향상시켜보세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfileStep
