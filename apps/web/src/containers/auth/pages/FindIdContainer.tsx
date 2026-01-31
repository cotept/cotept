"use client"

import React from "react"

import Link from "next/link"

import { FormStep } from "@repo/shared/src/components/form-step"
import FormStepContent from "@repo/shared/src/components/form-step-content"
import StepFlowLayout from "@repo/shared/src/components/step-flow-layout"

import { FindIdForm } from "@/features/auth/components/find-id/FindIdForm"
import Logo from "@/shared/ui/Logo"

export default function FindIdContainer() {
  return (
    <StepFlowLayout>
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="cursor-pointer">
          <Logo size="lg" variant="primary" margin={false} />
        </Link>
      </div>

      <FormStepContent>
        <FormStep title="아이디 찾기" description="가입 시 등록한 정보로 아이디를 찾을 수 있습니다." align="center">
          <FindIdForm />
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
