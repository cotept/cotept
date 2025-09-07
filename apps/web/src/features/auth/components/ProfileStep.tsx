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
    <>
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
                    className="border-zinc-600 bg-zinc-700/50 text-sm text-white placeholder:text-zinc-400 focus:border-purple-400"
                  />
                </FormControl>
                <FormMessage />

                {/* 닉네임 길이 표시 */}
                <div className="mt-1 flex items-center justify-between px-2">
                  <p className="text-xs text-zinc-500">한글과 영문만 사용 가능</p>
                  <p className="text-xs text-zinc-500">{field.value.length}/20</p>
                </div>
              </FormItem>
            )}
          />
          {/* 완료 버튼 */}
          <Button
            type="submit"
            variant={!isNicknameValid || isLoading ? "ghost" : "auth-special"}
            size="xl"
            disabled={!isNicknameValid || isLoading}
            className="w-full">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
      <div className="border-t border-zinc-700 pt-4 text-center">
        <p className="text-sm text-zinc-400">
          🎉 환영합니다! CotePT와 함께
          <br />
          코딩 테스트 실력을 향상시켜보세요!
        </p>
      </div>
    </>
  )
}

export default ProfileStep
