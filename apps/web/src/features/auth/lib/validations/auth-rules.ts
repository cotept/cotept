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
 * 회원가입 5단계: 프로필 설정 (현재는 닉네임만)
 */
export const ProfileStepRules = z.object({
  nickname: FieldRules.nickname(),
  // TODO: 추후 bio, interests, avatar 등 추가 예정
})

// 기존 로그인 규칙 (참고용)
export const LoginRules = z.object({
  email: FieldRules.email(),
  password: FieldRules.password(),
})

// 타입 추출
export type EmailStepData = z.infer<typeof EmailStepRules>
export type PasswordStepData = z.infer<typeof PasswordStepRules>
export type TermsStepData = z.input<typeof TermsStepRules>
export type VerificationStepData = z.infer<typeof VerificationStepRules>
export type ProfileStepData = z.infer<typeof ProfileStepRules>
export type LoginData = z.infer<typeof LoginRules>
