// CotePT 사용자 프로필 유효성 검사 규칙
import { z } from "zod"

/** - - - - - - - - - - - - - - - - -
 * 사용자 프로필 관련 규칙
 *- - - - - - - - - - - - - - - - -*/

/**
 * 닉네임 규칙 (2-50자, 한글/영문/숫자만)
 */
export const nicknameRule = (message?: string) =>
  z
    .string({ required_error: message ?? "닉네임은 필수 값입니다" })
    .min(2, "닉네임은 2자 이상이어야 합니다")
    .max(50, "닉네임은 50자 이하여야 합니다")
    .regex(/^[가-힣a-zA-Z]+$/, "닉네임은 한글, 영문자 허용됩니다 (특수문자,숫자, 공백 제외)")

/**
 * 실명 규칙 (2-50자, 한글/영문/공백만) - 선택사항
 */
export const fullNameRule = (message?: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // 선택사항이므로 비어있어도 OK
        const trimmed = val.trim()
        if (trimmed.length < 2) return false
        if (trimmed.length > 50) return false
        return /^[가-힣a-zA-Z\s]+$/.test(trimmed)
      },
      {
        message: message ?? "실명은 2-50자의 한글, 영문자만 허용됩니다",
      },
    )

/**
 * 자기소개 규칙 (280자 이하, 트위터 스타일) - 선택사항
 */
export const introduceRule = (message?: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // 선택사항
        return val.trim().length <= 280
      },
      {
        message: message ?? "자기소개는 280자 이하여야 합니다",
      },
    )

/**
 * 프로필 이미지 URL 규칙 - 선택사항
 */
export const profileImageUrlRule = (message?: string) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true // 선택사항
        const trimmed = val.trim()
        if (trimmed.length > 1000) return false
        try {
          new URL(trimmed)
          return true
        } catch {
          return false
        }
      },
      {
        message: message ?? "올바른 URL 형식이 아니거나 1000자를 초과했습니다",
      },
    )

/**
 * 사용자 프로필 생성 스키마
 */
export const createUserProfileSchema = z.object({
  userId: z.string().min(1, "사용자 아이디는 필수값입니다"), // 단순하게 필수값만 확인
  nickname: nicknameRule(),
  fullName: fullNameRule(),
  introduce: introduceRule(),
  profileImageUrl: profileImageUrlRule(),
})

/**
 * 사용자 프로필 업데이트 스키마
 */
export const updateUserProfileSchema = z.object({
  nickname: nicknameRule().optional(),
  fullName: fullNameRule(),
  introduce: introduceRule(),
  profileImageUrl: profileImageUrlRule(),
})

// 타입 추출
export type CreateUserProfileType = z.infer<typeof createUserProfileSchema>
export type UpdateUserProfileType = z.infer<typeof updateUserProfileSchema>
