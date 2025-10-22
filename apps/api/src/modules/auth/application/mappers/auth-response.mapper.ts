import { Injectable } from "@nestjs/common"

import { AvailabilityResultDto } from "@/modules/auth/application/dtos"
import { TokenPair } from "@/modules/auth/domain/model/token-pair"
import {
  AvailabilityResponseDto,
  EmailVerificationResultResponseDto,
  FindIdResponseDto,
  LogoutResponseDto,
  ResetPasswordResponseDto,
  SocialLinkConfirmationResponseDto,
  SocialRedirectResponseDto,
  TokenResponseDto,
  ValidationResultResponseDto,
  VerificationCodeResponseDto,
} from "@/modules/auth/infrastructure/dtos/response"

/**
 * 인증 응답 매퍼
 * Application DTO → Infrastructure Response DTO 변환
 */
@Injectable()
export class AuthResponseMapper {
  toTokenResponse(tokenPair: TokenPair): TokenResponseDto {
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: tokenPair.tokenType,
      expiresIn: tokenPair.accessTokenExpiresIn,
    }
  }

  toValidationResponse(isValid: boolean, userId?: string): ValidationResultResponseDto {
    return {
      isValid: isValid,
      userId: userId,
    }
  }

  toVerificationCodeResponse(verificationId: string, expiresAt: Date): VerificationCodeResponseDto {
    return {
      verificationId,
      expiresAt: expiresAt.toISOString(),
    }
  }

  toVerificationResultResponse(success: boolean): EmailVerificationResultResponseDto {
    return {
      success,
    }
  }

  toLogoutResponse(): LogoutResponseDto {
    return {
      success: true,
      loggedOutAt: new Date().toISOString(),
      message: "성공적으로 로그아웃되었습니다.",
    }
  }

  toFindIdResponse(maskedId: string): FindIdResponseDto {
    return {
      success: true,
      maskedId,
      message: "가입된 아이디를 찾았습니다.",
    }
  }

  toResetPasswordResponse(): ResetPasswordResponseDto {
    return {
      success: true,
      resetAt: new Date().toISOString(),
      message: "비밀번호가 성공적으로 재설정되었습니다.",
    }
  }

  toSocialLinkConfirmationResponse(linked: boolean): SocialLinkConfirmationResponseDto {
    return {
      success: true,
      linkStatus: linked ? "LINKED" : "REJECTED",
      processedAt: new Date().toISOString(),
      message: linked ? "소셜 계정이 성공적으로 연결되었습니다." : "소셜 계정 연결이 거부되었습니다.",
    }
  }

  toSocialRedirectResponse(
    redirectUrl: string,
    status: "SUCCESS" | "PENDING" | "ERROR" = "SUCCESS",
  ): SocialRedirectResponseDto {
    return {
      redirectUrl,
      status,
      message:
        status === "SUCCESS"
          ? "소셜 로그인이 성공적으로 처리되었습니다."
          : status === "ERROR"
            ? "소셜 로그인 처리 중 오류가 발생했습니다."
            : "소셜 로그인을 처리하고 있습니다.",
      processedAt: new Date().toISOString(),
    }
  }

  /**
   * 중복 확인 결과를 응답 DTO로 변환
   */
  toAvailabilityResponse(result: AvailabilityResultDto): AvailabilityResponseDto {
    return {
      available: result.available,
    }
  }
}
