/**
 * @fileoverview 회원가입 최종 검증 시스템
 * @description 회원가입 완료 단계에서 전체 데이터 검증
 */

import {
  EmailStepRules,
  PasswordStepRules,
  SetUserIdRules,
  SignupData,
  TermsStepRules,
  VerificationStepRules,
} from "./auth-rules"

/**
 * 유효성 검사 결과 인터페이스
 */
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
