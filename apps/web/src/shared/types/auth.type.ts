import { authApiService } from "@/shared/api/services/auth-api-service"

export type AuthApiService = typeof authApiService
export type AuthApiServiceMethod = keyof AuthApiService
export type AuthApiServiceMethodReturnType<T extends AuthApiServiceMethod> = Awaited<ReturnType<AuthApiService[T]>>
export type AuthApiServiceMethodParameters<T extends AuthApiServiceMethod> = Parameters<AuthApiService[T]>

// 로그인 관련 타입
export type LoginResponse = AuthApiServiceMethodReturnType<"login">
export type LoginParams = AuthApiServiceMethodParameters<"login">
export type LoginRequestData = LoginParams[0]["loginRequestDto"]

// 로그아웃 관련 타입
export type LogoutResponse = AuthApiServiceMethodReturnType<"logout">

// 토큰 갱신 관련 타입
export type RefreshTokenResponse = AuthApiServiceMethodReturnType<"refreshToken">
export type RefreshTokenParams = AuthApiServiceMethodParameters<"refreshToken">
export type RefreshTokenRequestData = RefreshTokenParams[0]["refreshTokenRequestDto"]

// 토큰 검증 관련 타입
export type ValidateTokenResponse = AuthApiServiceMethodReturnType<"validateToken">
export type ValidateTokenParams = AuthApiServiceMethodParameters<"validateToken">
export type ValidateTokenRequestData = ValidateTokenParams[0]["validateTokenRequestDto"]

// 소셜 로그인 코드 교환 관련 타입
export type ExchangeAuthCodeResponse = AuthApiServiceMethodReturnType<"exchangeAuthCode">
export type ExchangeAuthCodeParams = AuthApiServiceMethodParameters<"exchangeAuthCode">
export type ExchangeAuthCodeRequestData = ExchangeAuthCodeParams[0]["exchangeAuthCodeRequestDto"]

// 소셜 계정 연결 확인 관련 타입
export type ConfirmSocialLinkResponse = AuthApiServiceMethodReturnType<"confirmSocialLink">
export type ConfirmSocialLinkParams = AuthApiServiceMethodParameters<"confirmSocialLink">
export type ConfirmSocialLinkRequestData = ConfirmSocialLinkParams[0]["confirmSocialLinkRequestDto"]

// 인증 코드 발송 관련 타입
export type SendVerificationCodeResponse = AuthApiServiceMethodReturnType<"sendVerificationCode">
export type SendVerificationCodeParams = AuthApiServiceMethodParameters<"sendVerificationCode">
export type SendVerificationCodeRequestData = SendVerificationCodeParams[0]["sendVerificationCodeRequestDto"]

// 인증 코드 확인 관련 타입
export type VerifyCodeResponse = AuthApiServiceMethodReturnType<"verifyCode">
export type VerifyCodeParams = AuthApiServiceMethodParameters<"verifyCode">
export type VerifyCodeRequestData = VerifyCodeParams[0]["verifyCodeRequestDto"]

// 아이디 찾기 관련 타입
export type FindIdResponse = AuthApiServiceMethodReturnType<"findId">
export type FindIdParams = AuthApiServiceMethodParameters<"findId">
export type FindIdRequestData = FindIdParams[0]["findIdRequestDto"]

// 비밀번호 재설정 관련 타입
export type ResetPasswordResponse = AuthApiServiceMethodReturnType<"resetPassword">
export type ResetPasswordParams = AuthApiServiceMethodParameters<"resetPassword">
export type ResetPasswordRequestData = ResetPasswordParams[0]["resetPasswordRequestDto"]

// 이메일 중복 확인 관련 타입
export type CheckEmailAvailabilityResponse = AuthApiServiceMethodReturnType<"checkEmailAvailability">
export type CheckEmailAvailabilityParams = AuthApiServiceMethodParameters<"checkEmailAvailability">
export type CheckEmailAvailabilityRequestData = CheckEmailAvailabilityParams[0]["checkEmailAvailabilityRequestDto"]

// 아이디 중복 확인 관련 타입
export type CheckUserIdAvailabilityResponse = AuthApiServiceMethodReturnType<"checkUserIdAvailability">
export type CheckUserIdAvailabilityParams = AuthApiServiceMethodParameters<"checkUserIdAvailability">
export type CheckUserIdAvailabilityRequestData = CheckUserIdAvailabilityParams[0]["checkUserIdAvailabilityRequestDto"]
