/**
 * @fileoverview 회원가입 5단계 스테퍼 컨테이너 (라프텔 스타일)
 * @description 단계별 데이터 수집 및 최종 회원가입 처리
 */

"use client"

import { useState } from "react"

import { useCreateUser } from "@/features/user/api/mutations"
import type {
  EmailStepData,
  PasswordStepData,
  ProfileStepData,
  TermsStepData,
  VerificationStepData,
} from "@/features/auth/lib/validations/auth-rules"

// 전체 회원가입 데이터 타입
interface SignupData {
  email?: EmailStepData
  password?: PasswordStepData
  terms?: TermsStepData
  verification?: VerificationStepData
  profile?: ProfileStepData
}

// 회원가입 단계 타입
type SignupStep = 'email' | 'password' | 'terms' | 'verification' | 'profile'

interface SignupContainerProps {
  initialStep?: SignupStep
  onComplete?: () => void
  onCancel?: () => void
}

export function SignupContainer({
  initialStep = 'email',
  onComplete,
  onCancel,
}: SignupContainerProps) {
  // TODO(human): 상태 관리 구현
  // useState로 currentStep과 signupData 관리
  // currentStep: SignupStep 타입으로 현재 단계 추적
  // signupData: SignupData 타입으로 모든 단계 데이터 누적
  
  // TODO(human): API 훅 설정
  // useCreateUser 훅을 사용해서 최종 회원가입 처리
  // onSuccess에서 onComplete 콜백 호출
  // onError에서 적절한 에러 처리

  // TODO(human): 단계 완료 핸들러들 구현
  // handleEmailComplete: (data: EmailStepData) => void
  // handlePasswordComplete: (data: PasswordStepData) => void
  // handleTermsComplete: (data: TermsStepData) => void
  // handleVerificationComplete: (data: VerificationStepData) => void
  // handleProfileComplete: (data: ProfileStepData) => void
  //
  // 각 핸들러는:
  // 1. signupData 상태 업데이트
  // 2. 다음 단계로 currentStep 변경
  // 3. 마지막 단계(profile)에서는 createUser API 호출

  return (
    <div className="min-h-screen bg-black">
      {/* 라프텔 스타일: 좌상단 로고 */}
      <div className="absolute top-8 left-8">
        <div className="text-white text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          CotePT
        </div>
      </div>

      {/* 중앙 컨텐츠 */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* TODO(human): 단계별 컴포넌트 렌더링 */}
          {/* currentStep에 따라 적절한 단계 컴포넌트 렌더링 */}
          {/* 라프텔 스타일: 중앙 카드 형태의 폼 */}
          
          {/* TODO(human): 하단 네비게이션 링크 */}
          {/* 라프텔 스타일: "로그인 어려움을 겪고 계신가요?" */}
        </div>
      </div>
    </div>
  )
}