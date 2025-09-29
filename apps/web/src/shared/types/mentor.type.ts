import { mentorApiService } from "@/shared/api/services/mentor-api-service"

export type MentorApiService = typeof mentorApiService
export type MentorApiServiceMethod = keyof MentorApiService
export type MentorApiServiceMethodReturnType<T extends MentorApiServiceMethod> = Awaited<
  ReturnType<MentorApiService[T]>
>
export type MentorApiServiceMethodParameters<T extends MentorApiServiceMethod> = Parameters<MentorApiService[T]>

// 멘토 프로필 생성 관련 타입
export type CreateMentorProfileResponse = MentorApiServiceMethodReturnType<"createMentorProfile">
export type CreateMentorProfileParams = MentorApiServiceMethodParameters<"createMentorProfile">
export type CreateMentorProfileRequestData = CreateMentorProfileParams[0]["createMentorProfileDto"]

// 멘토 프로필 조회 관련 타입
export type GetMentorProfileResponse = MentorApiServiceMethodReturnType<"getMentorProfile">
export type GetMentorProfileParams = MentorApiServiceMethodParameters<"getMentorProfile">

// 멘토 프로필 수정 관련 타입
export type UpdateMentorProfileResponse = MentorApiServiceMethodReturnType<"updateMentorProfile">
export type UpdateMentorProfileParams = MentorApiServiceMethodParameters<"updateMentorProfile">
export type UpdateMentorProfileRequestData = UpdateMentorProfileParams[0]["updateMentorProfileDto"]

// 멘토 프로필 삭제 관련 타입
export type DeleteMentorProfileResponse = MentorApiServiceMethodReturnType<"deleteMentorProfile">
export type DeleteMentorProfileParams = MentorApiServiceMethodParameters<"deleteMentorProfile">

// 멘토 프로필 영구 삭제 관련 타입
export type HardDeleteMentorProfileResponse = MentorApiServiceMethodReturnType<"hardDeleteMentorProfile">
export type HardDeleteMentorProfileParams = MentorApiServiceMethodParameters<"hardDeleteMentorProfile">
