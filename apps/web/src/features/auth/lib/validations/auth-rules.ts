/**
 * @fileoverview CotePT 인증 관련 Zod 검증 규칙들
 * @description 회원가입 스테퍼, 로그인 등 인증 도메인 검증 로직
 */

import { z } from "zod"

import { FieldRules } from "@/shared/lib/validations/field-rules"

/**
 * 회원가입 1단계: 이메일 입력
 */
export const EmailStepRules = z.object({
  email: FieldRules.email(),
})

/**
 * 회원가입 2단계: 비밀번호 설정
 */
export const PasswordStepBaseRules = z.object({
  password: FieldRules.password(),
  confirmPassword: z.string({
    required_error: "비밀번호 확인을 입력해주세요",
  }),
})

export const PasswordStepRules = PasswordStepBaseRules.refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
})

/**
 * 회원가입 3단계: 약관 동의
 */
export const TermsStepRules = z.object({
  serviceTerms: FieldRules.requiredAgreement(),
  privacyPolicy: FieldRules.requiredAgreement(),
  ageConfirmation: FieldRules.requiredAgreement(),
  marketingConsent: FieldRules.optionalAgreement(),
})

/**
 * 회원가입 4단계: 이메일 인증
 */
export const VerificationStepRules = z.object({
  verificationCode: FieldRules.verificationCode(),
})
/**
 * 회원가입 5단계: 사용자 ID 설정
 */
export const SetUserIdRules = z.object({
  userId: FieldRules.userId(),
})

/**
 * 로그인 유효성 검사 스키마
 */
export const LoginRules = z.object({
  id: FieldRules.userId(),
  password: FieldRules.password(),
})

/**
 * 로그인 폼 기본값
 */
export const defaultLoginValues: LoginData = {
  id: "",
  password: "",
}

// 타입 추출
export type EmailStepData = z.infer<typeof EmailStepRules>
export type PasswordStepData = z.infer<typeof PasswordStepRules>
export type TermsStepData = z.input<typeof TermsStepRules>
export type SetUserIdData = z.input<typeof SetUserIdRules>
export type VerificationStepData = z.infer<typeof VerificationStepRules>
export type LoginData = z.infer<typeof LoginRules>

export interface SignupData {
  terms?: TermsStepData
  email?: EmailStepData
  verification?: VerificationStepData
  userId?: SetUserIdData
  password?: PasswordStepData
}

export interface ValidationResult {
  isValid: boolean
  errors: { [key in keyof SignupData]: string }
}

type validationError = { [key in keyof SignupData]: string }

/**
 * 회원가입 최종 완료 가능 여부 검증
 * @param data 전체 회원가입 데이터
 * @returns 최종 검증 결과
 */
export function validateFinalCompletion(data: SignupData): ValidationResult {
  const errors: validationError = {}

  // 1. 필수 데이터 존재 확인
  if (!data.terms) {
    errors.terms = "약관 동의가 완료되지 않았습니다."
  }

  if (!data.email) {
    errors.email = "이메일 입력이 완료되지 않았습니다."
  }

  if (!data.verification) {
    errors.verification = "이메일 인증이 완료되지 않았습니다."
  }

  if (!data.userId) {
    errors.userId = "아이디 설정이 완료되지 않았습니다."
  }

  if (!data.password) {
    errors.password = "비밀번호 설정이 완료되지 않았습니다."
  }

  // 2. 개별 스키마 검증 (존재하는 데이터만)
  if (data.terms) {
    const termsResult = TermsStepRules.safeParse(data.terms)
    if (!termsResult.success) {
      errors.terms = "약관 동의 정보가 올바르지 않습니다."
    }
  }

  if (data.email) {
    const emailResult = EmailStepRules.safeParse(data.email)
    if (!emailResult.success) {
      errors.email = "이메일 정보가 올바르지 않습니다."
    }
  }

  if (data.verification) {
    const verificationResult = VerificationStepRules.safeParse(data.verification)
    if (!verificationResult.success) {
      errors.verification = "이메일 인증 정보가 올바르지 않습니다."
    }
  }

  if (data.userId) {
    const userIdResult = SetUserIdRules.safeParse(data.userId)
    if (!userIdResult.success) {
      errors.userId = "아이디 정보가 올바르지 않습니다."
    }
  }

  if (data.password) {
    const passwordResult = PasswordStepRules.safeParse(data.password)
    if (!passwordResult.success) {
      errors.password = "비밀번호 정보가 올바르지 않습니다."
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
