"use client"

import React from "react"

import Link from "next/link"

import { FormStep } from "@repo/shared/src/components/form-step"
import FormStepContent from "@repo/shared/src/components/form-step-content"
import StepFlowLayout from "@repo/shared/src/components/step-flow-layout"

import { ResetPasswordForm } from "@/features/auth/components/reset-password/ResetPasswordForm"
import Logo from "@/shared/ui/Logo"

export default function ResetPasswordContainer() {
  return (
    <StepFlowLayout>
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="cursor-pointer">
          <Logo size="lg" variant="primary" margin={false} />
        </Link>
      </div>

      <FormStepContent>
        <FormStep title="비밀번호 찾기" description="가입한 이메일로 인증 후 비밀번호를 재설정합니다." align="center">
          <ResetPasswordForm />
        </FormStep>
      </FormStepContent>

      <div className="mt-8 text-center">
        <Link href="/auth/signin" className="text-fg-3 hover:text-primary text-sm transition-colors">
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </StepFlowLayout>
  )
}
