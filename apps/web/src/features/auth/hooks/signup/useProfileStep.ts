/**
 * @fileoverview 회원가입 5단계: 프로필 설정 훅
 * @description 닉네임 입력 및 중복 확인 로직
 */

"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { type ProfileStepData, ProfileStepRules } from "../../lib/validations/auth-rules"

interface UseProfileStepProps {
  onComplete: (data: ProfileStepData) => void
}

/**
 * 닉네임 중복 확인 시뮬레이션 훅
 * TODO: 실제 API 연동 시 대체 예정
 */
const useCheckNicknameMutation = () => {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = (
    nickname: string,
    options: { onSuccess: (response: { data: { result: boolean; message: string } }) => void },
  ) => {
    setIsLoading(true)

    // 300ms 지연 후 항상 사용 가능으로 반환 (시뮬레이션)
    setTimeout(() => {
      setIsLoading(false)
      // TODO: 실제 API에서는 닉네임 중복 확인 로직 구현
      options.onSuccess({ data: { result: true, message: "사용 가능한 닉네임입니다" } })
    }, 300)
  }

  return { mutate, isLoading }
}

/**
 * 프로필 설정 단계 훅
 *
 * @param onComplete - 단계 완료 시 콜백
 * @returns form 객체와 제출 핸들러
 */
export function useProfileStep({ onComplete }: UseProfileStepProps) {
  const form = useForm<ProfileStepData>({
    resolver: zodResolver(ProfileStepRules),
    defaultValues: {
      nickname: "",
    },
  })

  const { mutate: checkNickname, isLoading } = useCheckNicknameMutation()

  // TODO(human): handleSubmit 함수 구현
  // form.handleSubmit을 사용해서 닉네임 중복 확인 후 onComplete 호출
  // 중복된 닉네임인 경우 form.setError로 에러 메시지 설정
  const handleSubmit = form.handleSubmit(async (data) => {
    // 여기에 닉네임 중복 확인 로직 구현
    checkNickname(data.nickname, {
      onSuccess: (response) => {
        if (response.data.result) {
          onComplete(data)
        } else {
          form.setError("nickname", {
            message: response.data.message || "이미 사용 중인 닉네임입니다",
          })
        }
      },
    })
  })

  // 실시간 닉네임 유효성 확인
  const nickname = form.watch("nickname")
  const isNicknameValid = ProfileStepRules.safeParse({ nickname }).success

  return {
    form,
    handleSubmit,
    isLoading,
    isNicknameValid,
    nickname,
  }
}
