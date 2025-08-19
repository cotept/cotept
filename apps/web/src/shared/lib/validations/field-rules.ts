/**
 * @fileoverview CotePT 프로젝트 공통 필드 검증 규칙들
 * @description 재사용 가능한 Zod 필드 검증 로직 모음
 */

import { z } from "zod"

/**
 * 프로젝트 전체에서 사용하는 공통 필드 검증 규칙들
 */
export const FieldRules = {
  /**
   * 이메일 주소 검증
   */
  email: () =>
    z
      .string({
        required_error: "이메일을 입력해주세요",
        invalid_type_error: "이메일은 문자열이어야 합니다",
      })
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식이 아닙니다")
      .max(254, "이메일이 너무 깁니다")
      .transform((email) => email.toLowerCase().trim()),

  /**
   * 비밀번호 검증 (8자 이상, 영문+숫자+특수문자)
   */
  password: () =>
    z
      .string({
        required_error: "비밀번호를 입력해주세요",
        invalid_type_error: "비밀번호는 문자열이어야 합니다",
      })
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .max(32, "비밀번호는 32자 이하여야 합니다")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
        "영문, 숫자, 특수문자를 모두 포함해야 합니다",
      ),

  /**
   * 닉네임 검증 (2-20자, 한글/영문/숫자)
   */
  nickname: () =>
    z
      .string({
        required_error: "닉네임을 입력해주세요",
        invalid_type_error: "닉네임은 문자열이어야 합니다",
      })
      .min(2, "닉네임은 2자 이상이어야 합니다")
      .max(15, "닉네임은 15자 이하여야 합니다")
      .regex(/^[가-힣a-zA-Z0-9]+$/, "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다")
      .trim(),

  /**
   * 인증 코드 검증 (6자리 숫자)
   */
  verificationCode: () =>
    z
      .string({
        required_error: "인증 코드를 입력해주세요",
        invalid_type_error: "인증 코드는 문자열이어야 합니다",
      })
      .length(6, "인증 코드는 6자리입니다")
      .regex(/^\d{6}$/, "인증 코드는 숫자만 입력할 수 있습니다"),

  /**
   * 필수 약관 동의 검증
   */
  requiredAgreement: () =>
    z
      .boolean({
        required_error: "필수 약관에 동의해야 합니다",
      })
      .refine((val) => val === true, "필수 약관에 동의해야 합니다"),

  /**
   * 선택 약관 동의 검증
   */
  optionalAgreement: () => z.boolean().optional().default(false),

  /**
   * 프로필 이미지 파일 검증 (선택사항)
   */
  profileImage: () =>
    z
      .instanceof(File)
      .refine(
        (file) => file.size <= 5 * 1024 * 1024, // 5MB
        "이미지 크기는 5MB 이하여야 합니다"
      )
      .refine(
        (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        "JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다"
      )
      .optional(),
} as const
