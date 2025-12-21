/**
 * @fileoverview CotePT 온보딩 관련 Zod 검증 규칙들
 * @description 온보딩 단계별 검증 로직 (프로필 설정, 백준 인증, 멘토 프로필)
 */

import { DeepPartial } from "@repo/shared/src/types/types"

import { z } from "zod"

import type {
  CompleteBaekjoonVerificationDto,
  CreateBasicProfileDto,
  OnboardingCreateMentorProfileDto,
  StartBaekjoonVerificationDto,
} from "@repo/api-client"

import { sanitizeToPlainText } from "@repo/shared/lib/sanitize"
import { FieldRules } from "@/shared/lib/validations/field-rules"
import { imageFile, url } from "@repo/shared/src/rules"

/**
 * 프로필 이미지 허용 파일 타입
 *
 * ★ Insight:
 * - 단일 진실 원천(Single Source of Truth)
 * - Zod 검증과 HTML input accept 속성에 공유
 * - WebP 추가로 최신 이미지 포맷 지원
 */
export const PROFILE_IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

/**
 * 프로필 이미지 최대 파일 크기 (바이트)
 */
export const PROFILE_IMAGE_MAX_SIZE = 5 // 5MB

/**
 * HTML input accept 속성용 문자열
 *
 * @example
 * <input type="file" accept={PROFILE_IMAGE_ACCEPT_STRING} />
 * // => accept="image/jpeg, image/png, image/webp"
 */
export const PROFILE_IMAGE_ACCEPT_STRING = PROFILE_IMAGE_ACCEPTED_TYPES.join(", ")

const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
] as const

const COMPANY_EMAIL_ERROR = "회사 이메일을 입력해주세요 (개인 이메일은 사용할 수 없습니다)"

const isCorporateEmail = (email: string) => !PERSONAL_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`))

/**
 * 온보딩 1단계: 기본 프로필 설정
 */
export const ProfileSetupRules = z.object({
  nickname: FieldRules.nickname(),
  profileImageUrl: url("올바른 이미지 URL 형식이 아닙니다").optional(),
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
      url("올바른 이미지 URL 형식이 아닙니다"),
      imageFile(PROFILE_IMAGE_MAX_SIZE, [...PROFILE_IMAGE_ACCEPTED_TYPES]),
    ])
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true
        return typeof val === "string" || val instanceof File
      },
      { message: "올바른 형식이 아닙니다" },
    ),
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
 * 백준 인증 스텝 데이터 (온보딩 플로우 상태 저장용)
 *
 * ★ Insight:
 * - StartBaekjoonVerificationDto에서 userId 제외 (세션에서 관리)
 * - verificationSessionId는 인증 완료 시에만 추가됨 (선택적)
 * - API 호출 시 세션의 userId와 조합하여 DTO로 변환
 * - ProfileSetupData와 동일한 패턴 (API DTO에서 userId를 제외한 필드)
 */
export const BaekjoonVerifyStepRules = z.object({
  baekjoonHandle: z.string(),
  verificationSessionId: z.string().optional(),
}) satisfies z.ZodType<
  Pick<StartBaekjoonVerificationDto, "baekjoonHandle"> &
    DeepPartial<Pick<CompleteBaekjoonVerificationDto, "verificationSessionId">>
>

/**
 * 멘토 프로필 F4: 태그 선택 (직무/연차/회사 규모/회사 유형)
 */
export const MentorTagsRules = z.object({
  jobTagId: z.number({
    required_error: "직무 태그를 선택해주세요",
    invalid_type_error: "직무 태그를 선택해주세요",
  }),
  levelTagId: z.number({
    required_error: "연차 태그를 선택해주세요",
    invalid_type_error: "연차 태그를 선택해주세요",
  }),
  companySizeTagId: z.number({
    required_error: "회사 규모 태그를 선택해주세요",
    invalid_type_error: "회사 규모 태그를 선택해주세요",
  }),
  companyTypeTagId: z.number({
    required_error: "회사 유형 태그를 선택해주세요",
    invalid_type_error: "회사 유형 태그를 선택해주세요",
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
    .refine(
      (value) => sanitizeToPlainText(value).trim().length >= 10,
      "멘토 소개는 10자 이상 작성해주세요",
    )
    .refine(
      (value) => sanitizeToPlainText(value).trim().length <= 1000,
      "멘토 소개는 1000자 이하로 작성해주세요",
    ),
})

/**
 * 멘토 프로필 셋업 폼 (태그 + 소개 + 회사 이메일)
 */
export const MentorProfileSetupFormRules = MentorTagsRules.extend({
  introductionTitle: MentorIntroRules.shape.introductionTitle,
  introductionContent: MentorIntroRules.shape.introductionContent,
  // companyEmail: FieldRules.email().refine(isCorporateEmail, COMPANY_EMAIL_ERROR),
})

/**
 * 멘토 프로필 완성 (F4 + F5 통합)
 */
export const MentorProfileRules = z.object({
  userId: z.string(),
  tagIds: z
    .array(z.number())
    .length(4, "직무, 연차, 회사 규모, 회사 유형 태그를 모두 선택해주세요")
    .refine((ids) => ids.every((id) => id > 0), "올바른 태그를 선택해주세요"),
  introductionTitle: MentorIntroRules.shape.introductionTitle,
  introductionContent: MentorIntroRules.shape.introductionContent,
  // companyEmail: FieldRules.email().refine(isCorporateEmail, COMPANY_EMAIL_ERROR),
}) satisfies z.ZodType<OnboardingCreateMentorProfileDto>

// 타입 추출
export type ProfileSetupData = z.infer<typeof ProfileSetupRules>
export type ProfileSetupFormData = z.infer<typeof ProfileSetupFormRules>
export type BaekjoonVerifyStartData = z.infer<typeof BaekjoonVerifyStartRules>
export type BaekjoonVerifyStartFormData = z.infer<typeof BaekjoonVerifyStartFormRules>
export type BaekjoonVerifyCompleteData = z.infer<typeof BaekjoonVerifyCompleteRules>
export type BaekjoonVerifyStepData = z.infer<typeof BaekjoonVerifyStepRules>
export type MentorTagsData = z.infer<typeof MentorTagsRules>
export type MentorIntroData = z.infer<typeof MentorIntroRules>
export type MentorProfileData = z.infer<typeof MentorProfileRules>
export type MentorProfileSetupFormData = z.infer<typeof MentorProfileSetupFormRules>

/**
 * 온보딩 전체 플로우 데이터
 *
 * ★ Insight:
 * - profile: 1단계 기본 프로필 설정
 * - baekjoonVerification: 2단계 백준 인증
 * - mentorProfile: 3단계 멘토 정보 입력 (조건부)
 * - isMentorEligible: 백준 인증 후 멘토 자격 여부 (Platinum III+)
 * - wantsToBeMentor: 사용자가 멘토 전환을 수락했는지 여부
 */
export type OnboardingData = {
  profile?: ProfileSetupData
  baekjoonVerification?: BaekjoonVerifyStepData
  mentorProfile?: {
    tags: MentorTagsData
    intro: MentorIntroData
  }
  // 멘토 전환 플로우 제어
  isMentorEligible?: boolean // Platinum III+ 여부
  wantsToBeMentor?: boolean // 멘토 전환 수락 여부
}

/**
 * 멘토 프로필 데이터 → API DTO 변환 헬퍼
 *
 * ★ Insight:
 * - OnboardingData.mentorProfile → MentorProfileData (API DTO)
 * - userId는 세션에서 주입
 * - 태그 4개(직무, 연차, 회사 규모, 회사 유형)를 배열로 변환
 */
export function transformToMentorProfileDto(
  userId: string,
  tagsData: MentorTagsData,
  introData: MentorIntroData,
): MentorProfileData {
  return {
    userId,
    tagIds: [tagsData.jobTagId, tagsData.levelTagId, tagsData.companySizeTagId, tagsData.companyTypeTagId],
    introductionTitle: introData.introductionTitle,
    introductionContent: introData.introductionContent,
  }
}

/**
 * OnboardingData에서 멘토 프로필 DTO 추출 헬퍼
 *
 * ★ Insight:
 * - 온보딩 완료 시 mentorProfile 데이터를 API DTO로 변환
 * - mentorProfile이 없으면 undefined 반환 (멘티 플로우)
 */
export function extractMentorProfileDto(userId: string, onboardingData: OnboardingData): MentorProfileData | undefined {
  if (!onboardingData.mentorProfile) {
    return undefined
  }

  return transformToMentorProfileDto(userId, onboardingData.mentorProfile.tags, onboardingData.mentorProfile.intro)
}
