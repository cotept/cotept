import { userApiService } from "@/shared/api/services/user-api-service"

export type UserApiService = typeof userApiService
export type UserApiServiceMethod = keyof UserApiService
export type UserApiServiceMethodReturnType<T extends UserApiServiceMethod> = Awaited<ReturnType<UserApiService[T]>>
export type UserApiServiceMethodParameters<T extends UserApiServiceMethod> = Parameters<UserApiService[T]>

// 타입 alias 생성
export type UpdateUserResponse = UserApiServiceMethodReturnType<"updateUser">
export type UpdateUserParams = UserApiServiceMethodParameters<"updateUser">
export type CreateUserResponse = UserApiServiceMethodReturnType<"createUser">
export type CreateUserParams = UserApiServiceMethodParameters<"createUser">
export type DeleteUserResponse = UserApiServiceMethodReturnType<"deleteUser">
export type DeleteUserParams = UserApiServiceMethodParameters<"deleteUser">

// UpdateUserParams에서 실제 업데이트 데이터 타입 추출
export type UpdateUserRequestData = UpdateUserParams[0]["updateUserRequestDto"]
