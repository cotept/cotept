import { userProfileApiService } from "@/shared/api/services/user-profile-api-service"

export type UserProfileApiService = typeof userProfileApiService
export type UserProfileApiServiceMethod = keyof UserProfileApiService
export type UserProfileApiServiceMethodReturnType<T extends UserProfileApiServiceMethod> = Awaited<
  ReturnType<UserProfileApiService[T]>
>
export type UserProfileApiServiceMethodParameters<T extends UserProfileApiServiceMethod> = Parameters<
  UserProfileApiService[T]
>

// 기본 CRUD 타입 alias 생성
export type CreateUserProfileResponse = UserProfileApiServiceMethodReturnType<"createUserProfile">
export type CreateUserProfileParams = UserProfileApiServiceMethodParameters<"createUserProfile">
export type UpdateUserProfileResponse = UserProfileApiServiceMethodReturnType<"updateUserProfile">
export type UpdateUserProfileParams = UserProfileApiServiceMethodParameters<"updateUserProfile">
export type DeleteUserProfileResponse = UserProfileApiServiceMethodReturnType<"deleteUserProfile">
export type DeleteUserProfileParams = UserProfileApiServiceMethodParameters<"deleteUserProfile">

// 조회 타입 alias 생성
export type GetUserProfileResponse = UserProfileApiServiceMethodReturnType<"getUserProfile">
export type GetUserProfileParams = UserProfileApiServiceMethodParameters<"getUserProfile">
export type GetUserProfileByIdxResponse = UserProfileApiServiceMethodReturnType<"getUserProfileByIdx">
export type GetUserProfileByIdxParams = UserProfileApiServiceMethodParameters<"getUserProfileByIdx">

// 복합 작업 타입 alias 생성
export type UpsertUserProfileResponse = UserProfileApiServiceMethodReturnType<"upsertUserProfile">
export type UpsertUserProfileParams = UserProfileApiServiceMethodParameters<"upsertUserProfile">
export type CheckProfileCompletenessResponse = UserProfileApiServiceMethodReturnType<"checkProfileCompleteness">
export type CheckProfileCompletenessParams = UserProfileApiServiceMethodParameters<"checkProfileCompleteness">
export type CreateBasicProfileForSignupResponse = UserProfileApiServiceMethodReturnType<"createBasicProfileForSignup">
export type CreateBasicProfileForSignupParams = UserProfileApiServiceMethodParameters<"createBasicProfileForSignup">

// Request DTO 타입 추출 (실제 API 요청에 사용)
export type CreateUserProfileRequestData = CreateUserProfileParams[0]["createUserProfileRequestDto"]
export type UpdateUserProfileRequestData = UpdateUserProfileParams[0]["updateUserProfileRequestDto"]
