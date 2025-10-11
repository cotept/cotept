/**
 * @fileoverview CotePT 온보딩 관련 Zod 검증 규칙들
 * @description 온보딩 단계별 검증 로직 (프로필 설정, 백준 인증, 멘토 프로필)
 */

import { z } from "zod"

import type {
  CreateBasicProfileDto,
  OnboardingCreateMentorProfileDto,
  StartBaekjoonVerificationDto,
} from "@repo/api-client"

import { FieldRules } from "@/shared/lib/validations/field-rules"

/**
 * 온보딩 1단계: 기본 프로필 설정
 */
export const ProfileSetupRules = z.object({
  userId: z.string(),
  nickname: FieldRules.nickname(),
  profileImageUrl: z.string().url("올바른 이미지 URL 형식이 아닙니다").optional(),
}) satisfies z.ZodType<CreateBasicProfileDto>

/**
 * 프로필 이미지 파일 또는 URL 검증 (폼 입력용)
 *
 * ★ Insight:
 * - 기본 프로필 선택 시: URL 문자열
 * - 새 이미지 업로드 시: File 객체 (5MB 제한, JPG/PNG/WebP)
 * - File 객체는 업로드 후 URL로 변환되어 API로 전송
 */
export const ProfileSetupFormRules = z.object({
  userId: z.string(),
  nickname: FieldRules.nickname(),
  profileImage: z
    .union([
      z.string().url("올바른 이미지 URL 형식이 아닙니다"),
      z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, "이미지 크기는 5MB 이하여야 합니다")
        .refine(
          (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "JPG, PNG, Webp 형식의 이미지만 업로드할 수 있습니다",
        ),
    ])
    .optional(),
})

/**
 * 온보딩 2단계: 백준 ID 인증 시작
 */
export const BaekjoonVerifyStartRules = z.object({
  userId: z.string(),
  baekjoonHandle: z
    .string({
      required_error: "백준 아이디를 입력해주세요",
      invalid_type_error: "백준 아이디는 문자열이어야 합니다",
    })
    .min(3, "백준 아이디는 3자 이상이어야 합니다")
    .max(20, "백준 아이디는 20자 이하여야 합니다")
    .regex(/^[a-zA-Z0-9_]+$/, "영문, 숫자, 언더스코어(_)만 사용할 수 있습니다"),
}) satisfies z.ZodType<StartBaekjoonVerificationDto>

/**
 * 온보딩 2단계: 백준 ID 인증 완료
 */
export const BaekjoonVerifyCompleteRules = z.object({
  userId: z.string(),
  baekjoonHandle: z.string(),
  verificationCode: z
    .string({
      required_error: "인증 문자열을 입력해주세요",
    })
    .min(1, "인증 문자열을 입력해주세요"),
})

/**
 * 멘토 프로필 F4: 태그 선택 (직무/연차/회사)
 */
export const MentorTagsRules = z.object({
  jobTagId: z.number({
    required_error: "직무를 선택해주세요",
    invalid_type_error: "직무는 숫자여야 합니다",
  }),
  levelTagId: z.number({
    required_error: "연차를 선택해주세요",
    invalid_type_error: "연차는 숫자여야 합니다",
  }),
  companyTagId: z.number({
    required_error: "회사 유형을 선택해주세요",
    invalid_type_error: "회사 유형은 숫자여야 합니다",
  }),
})

/**
 * 멘토 프로필 F5: 소개글 작성
 */
export const MentorIntroRules = z.object({
  introductionTitle: z.string().max(100, "소개 제목은 100자 이하여야 합니다").optional(),
  introductionContent: z
    .string({
      required_error: "멘토 소개를 작성해주세요",
    })
    .min(50, "멘토 소개는 50자 이상 작성해주세요")
    .max(5000, "멘토 소개는 5000자 이하로 작성해주세요"),
})

/**
 * 멘토 프로필 완성 (F4 + F5 통합)
 */
export const MentorProfileRules = z.object({
  userId: z.string(),
  tagIds: z
    .array(z.number())
    .length(3, "직무, 연차, 회사 태그를 모두 선택해주세요")
    .refine((ids) => ids.every((id) => id > 0), "올바른 태그를 선택해주세요"),
  introductionTitle: z.string().max(100, "소개 제목은 100자 이하여야 합니다").optional(),
  introductionContent: z
    .string({
      required_error: "멘토 소개를 작성해주세요",
    })
    .min(50, "멘토 소개는 50자 이상 작성해주세요")
    .max(5000, "멘토 소개는 5000자 이하로 작성해주세요"),
}) satisfies z.ZodType<OnboardingCreateMentorProfileDto>

// 타입 추출
export type ProfileSetupData = z.infer<typeof ProfileSetupRules>
export type ProfileSetupFormData = z.infer<typeof ProfileSetupFormRules>
export type BaekjoonVerifyStartData = z.infer<typeof BaekjoonVerifyStartRules>
export type BaekjoonVerifyCompleteData = z.infer<typeof BaekjoonVerifyCompleteRules>
export type MentorTagsData = z.infer<typeof MentorTagsRules>
export type MentorIntroData = z.infer<typeof MentorIntroRules>
export type MentorProfileData = z.infer<typeof MentorProfileRules>

/**
 * 폼 데이터 → API DTO 변환 헬퍼
 *
 * ★ Insight:
 * - File 객체는 별도 업로드 API 호출 후 URL 반환받아 사용
 * - 기본 프로필 이미지 선택 시에는 이미 URL이므로 그대로 사용
 */
export function transformToProfileSetupDto(
  formData: ProfileSetupFormData,
  uploadedImageUrl?: string,
): ProfileSetupData {
  return {
    userId: formData.userId,
    nickname: formData.nickname,
    profileImageUrl:
      uploadedImageUrl || (typeof formData.profileImage === "string" ? formData.profileImage : undefined),
  }
}

/**
 * 멘토 태그 데이터 → API DTO 변환 헬퍼
 */
export function transformToMentorProfileDto(
  userId: string,
  tagsData: MentorTagsData,
  introData: MentorIntroData,
): MentorProfileData {
  return {
    userId,
    tagIds: [tagsData.jobTagId, tagsData.levelTagId, tagsData.companyTagId],
    introductionTitle: introData.introductionTitle,
    introductionContent: introData.introductionContent,
  }
}
