import { onboardingApiService } from "@/shared/api/services/onboarding-api-service"

export type OnboardingApiService = typeof onboardingApiService
export type OnboardingApiServiceMethod = keyof OnboardingApiService
export type OnboardingApiServiceMethodReturnType<T extends OnboardingApiServiceMethod> = Awaited<
  ReturnType<OnboardingApiService[T]>
>
export type OnboardingApiServiceMethodParameters<T extends OnboardingApiServiceMethod> = Parameters<
  OnboardingApiService[T]
>

// 기본 프로필 생성 관련 타입
export type CreateBasicProfileResponse = OnboardingApiServiceMethodReturnType<"createBasicProfile">
export type CreateBasicProfileParams = OnboardingApiServiceMethodParameters<"createBasicProfile">
export type CreateBasicProfileRequestData = CreateBasicProfileParams[0]["createBasicProfileDto"]

// 백준 인증 시작 관련 타입
export type StartBaekjoonVerificationResponse = OnboardingApiServiceMethodReturnType<"startBaekjoonVerification">
export type StartBaekjoonVerificationParams = OnboardingApiServiceMethodParameters<"startBaekjoonVerification">
export type StartBaekjoonVerificationRequestData = StartBaekjoonVerificationParams[0]["startBaekjoonVerificationDto"]

// 백준 인증 완료 관련 타입
export type CompleteBaekjoonVerificationResponse = OnboardingApiServiceMethodReturnType<"completeBaekjoonVerification">
export type CompleteBaekjoonVerificationParams = OnboardingApiServiceMethodParameters<"completeBaekjoonVerification">
export type CompleteBaekjoonVerificationRequestData =
  CompleteBaekjoonVerificationParams[0]["completeBaekjoonVerificationDto"]

// 실력 분석 관련 타입
export type AnalyzeSkillsResponse = OnboardingApiServiceMethodReturnType<"analyzeSkills">
export type AnalyzeSkillsParams = OnboardingApiServiceMethodParameters<"analyzeSkills">

// 멘토 자격 요건 확인 관련 타입
export type CheckMentorEligibilityResponse = OnboardingApiServiceMethodReturnType<"checkMentorEligibility">
export type CheckMentorEligibilityParams = OnboardingApiServiceMethodParameters<"checkMentorEligibility">

// 멘토 태그 조회 관련 타입
export type GetMentorTagsResponse = OnboardingApiServiceMethodReturnType<"getMentorTags">
export type GetMentorTagsParams = OnboardingApiServiceMethodParameters<"getMentorTags">

// 멘토 프로필 생성 관련 타입
export type CreateMentorProfileResponse = OnboardingApiServiceMethodReturnType<"createMentorProfileOnboarding">
export type CreateMentorProfileParams = OnboardingApiServiceMethodParameters<"createMentorProfileOnboarding">
export type CreateMentorProfileRequestData = CreateMentorProfileParams[0]["createMentorProfileDto"]

// 온보딩 완료 관련 타입
export type CompleteOnboardingResponse = OnboardingApiServiceMethodReturnType<"completeOnboarding">
export type CompleteOnboardingParams = OnboardingApiServiceMethodParameters<"completeOnboarding">
