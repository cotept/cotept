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
 * 프로필 이미지 허용 파일 타입
 *
 * ★ Insight:
 * - 단일 진실 원천(Single Source of Truth)
 * - Zod 검증과 HTML input accept 속성에 공유
 * - WebP 추가로 최신 이미지 포맷 지원
 */
export const PROFILE_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

/**
 * 프로필 이미지 최대 파일 크기 (바이트)
 */
export const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * HTML input accept 속성용 문자열
 *
 * @example
 * <input type="file" accept={PROFILE_IMAGE_ACCEPT_STRING} />
 * // => accept="image/jpeg, image/png, image/webp"
 */
export const PROFILE_IMAGE_ACCEPT_STRING = PROFILE_IMAGE_ACCEPTED_TYPES.join(", ")

/**
 * 온보딩 1단계: 기본 프로필 설정
 */
export const ProfileSetupRules = z.object({
  nickname: FieldRules.nickname(),
  profileImageUrl: z.string().url("올바른 이미지 URL 형식이 아닙니다").optional(),
}) satisfies z.ZodType<Pick<CreateBasicProfileDto, "nickname" | "profileImageUrl">>

/**
 * 프로필 이미지 파일 또는 URL 검증 (폼 입력용)
 *
 * ★ Insight:
 * - 기본 프로필 선택 시: URL 문자열
 * - 새 이미지 업로드 시: File 객체 (5MB 제한, JPG/PNG/WebP)
 * - File 객체는 업로드 후 URL로 변환되어 API로 전송
 */
export const ProfileSetupFormRules = z.object({
  nickname: FieldRules.nickname(),
  profileImage: z
    .union([
      z.string().url("올바른 이미지 URL 형식이 아닙니다"),
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= PROFILE_IMAGE_MAX_SIZE,
          `이미지 크기는 ${PROFILE_IMAGE_MAX_SIZE / (1024 * 1024)}MB 이하여야 합니다`,
        )
        .refine(
          (file) => PROFILE_IMAGE_ACCEPTED_TYPES.includes(file.type as any),
          "JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다",
        ),
    ])
    .optional(),
})

/**
 * 온보딩 2단계: 백준 ID 인증 시작 (API 전송용)
 *
 * ★ Insight:
 * - API DTO와 1:1 매핑되는 스키마
 * - userId는 런타임에 세션에서 주입
 * - baekjoonHandle 검증 규칙:
 *   - 3-20자: solved.ac 정책 준수
 *   - 영문/숫자/_: 백준 ID 정책
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
 * 백준 ID 인증 시작 (폼 입력용)
 *
 * ★ Insight:
 * - userId 제외: 폼에서는 백준 ID만 입력받음
 * - 실시간 검증 지원을 위해 독립적으로 정의
 * - react-hook-form과 직접 연동
 */
export const BaekjoonVerifyStartFormRules = z.object({
  baekjoonHandle: z
    .string({
      required_error: "백준 아이디를 입력해주세요",
      invalid_type_error: "백준 아이디는 문자열이어야 합니다",
    })
    .min(3, "백준 아이디는 3자 이상이어야 합니다")
    .max(20, "백준 아이디는 20자 이하여야 합니다")
    .regex(/^[a-zA-Z0-9_]+$/, "영문, 숫자, 언더스코어(_)만 사용할 수 있습니다"),
})

/**
 * 온보딩 2단계: 백준 ID 인증 완료
 *
 * ★ Insight:
 * - verificationCode: 서버에서 발급받은 랜덤 문자열
 * - 사용자가 solved.ac 프로필 이름에 입력 후 검증
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
export type BaekjoonVerifyStartFormData = z.infer<typeof BaekjoonVerifyStartFormRules>
export type BaekjoonVerifyCompleteData = z.infer<typeof BaekjoonVerifyCompleteRules>
export type MentorTagsData = z.infer<typeof MentorTagsRules>
export type MentorIntroData = z.infer<typeof MentorIntroRules>
export type MentorProfileData = z.infer<typeof MentorProfileRules>

/**
 * 온보딩 전체 플로우 데이터
 */
export type OnboardingData = {
  profile?: ProfileSetupData
  baekjoonVerification?: BaekjoonVerifyStartData & Partial<BaekjoonVerifyCompleteData>
  mentorTags?: MentorTagsData
  mentorIntro?: MentorIntroData
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
