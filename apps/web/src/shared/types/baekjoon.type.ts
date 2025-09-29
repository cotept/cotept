import { baekjoonApiService } from "@/shared/api/services/baekjoon-api-service"

export type BaekjoonApiService = typeof baekjoonApiService
export type BaekjoonApiServiceMethod = keyof BaekjoonApiService
export type BaekjoonApiServiceMethodReturnType<T extends BaekjoonApiServiceMethod> = Awaited<
  ReturnType<BaekjoonApiService[T]>
>
export type BaekjoonApiServiceMethodParameters<T extends BaekjoonApiServiceMethod> = Parameters<BaekjoonApiService[T]>

// 백준 프로필 조회 관련 타입
export type GetProfileResponse = BaekjoonApiServiceMethodReturnType<"getProfile">
export type GetProfileParams = BaekjoonApiServiceMethodParameters<"getProfile">

// 백준 통계 조회 관련 타입
export type GetStatisticsResponse = BaekjoonApiServiceMethodReturnType<"getStatistics">
export type GetStatisticsParams = BaekjoonApiServiceMethodParameters<"getStatistics">

// 백준 인증 시작 관련 타입
export type StartVerificationResponse = BaekjoonApiServiceMethodReturnType<"startVerification">
export type StartVerificationParams = BaekjoonApiServiceMethodParameters<"startVerification">
export type StartVerificationRequestData = StartVerificationParams[0]["startVerificationRequestDto"]

// 백준 인증 완료 관련 타입
export type CompleteVerificationResponse = BaekjoonApiServiceMethodReturnType<"completeVerification">
export type CompleteVerificationParams = BaekjoonApiServiceMethodParameters<"completeVerification">
export type CompleteVerificationRequestData = CompleteVerificationParams[0]["completeVerificationRequestDto"]

// 백준 인증 상태 조회 관련 타입
export type GetVerificationStatusResponse = BaekjoonApiServiceMethodReturnType<"getVerificationStatus">
export type GetVerificationStatusParams = BaekjoonApiServiceMethodParameters<"getVerificationStatus">
