import { Injectable } from "@nestjs/common"

import { plainToInstance } from "class-transformer"

import {
  FindIdDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendVerificationCodeDto,
  ValidateTokenDto,
  VerifyCodeDto,
} from "@/modules/auth/application/dtos"
import {
  FindIdRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  ResetPasswordRequestDto,
  SendVerificationCodeRequestDto,
  ValidateTokenRequestDto,
  VerifyCodeRequestDto,
} from "@/modules/auth/infrastructure/dtos/request"

/**
 * 인바운드 어댑터 매퍼
 * HTTP 요청에서 받은 데이터를 애플리케이션에서 사용할 DTO로 변환
 */
@Injectable()
export class AuthRequestMapper {
  /**
   * 로그인 요청 DTO를 내부 DTO로 변환
   */
  toLoginDto(request: LoginRequestDto, ipAddress?: string, userAgent?: string): LoginDto {
    const dto = plainToInstance(
      LoginDto,
      {
        ...request,
        ipAddress,
        userAgent,
      },
      {
        excludeExtraneousValues: true,
      },
    )

    return dto
  }

  /**
   * 토큰 갱신 요청 DTO를 내부 DTO로 변환
   */
  toRefreshTokenDto(request: RefreshTokenRequestDto, ipAddress?: string, userAgent?: string): RefreshTokenDto {
    const dto = plainToInstance(
      RefreshTokenDto,
      {
        ...request,
        ipAddress,
        userAgent,
      },
      {
        excludeExtraneousValues: true,
      },
    )

    return dto
  }

  /**
   * 토큰 검증 요청 DTO를 내부 DTO로 변환
   */
  toValidateTokenDto(request: ValidateTokenRequestDto): ValidateTokenDto {
    return plainToInstance(ValidateTokenDto, request, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * 로그아웃 요청을 내부 DTO로 변환
   */
  toLogoutDto(userId: string, token: string): LogoutDto {
    return plainToInstance(
      LogoutDto,
      {
        userId,
        token,
      },
      {
        excludeExtraneousValues: true,
      },
    )
  }

  /**
   * 인증 코드 발송 요청 DTO를 내부 DTO로 변환
   */
  toSendVerificationCodeDto(
    request: SendVerificationCodeRequestDto,
    userId?: string,
    ipAddress?: string,
  ): SendVerificationCodeDto {
    const dto = plainToInstance(
      SendVerificationCodeDto,
      {
        ...request,
        userId,
        ipAddress,
      },
      {
        excludeExtraneousValues: true,
      },
    )

    return dto
  }

  /**
   * 인증 코드 확인 요청 DTO를 내부 DTO로 변환
   */
  toVerifyCodeDto(request: VerifyCodeRequestDto): VerifyCodeDto {
    return plainToInstance(VerifyCodeDto, request, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * 아이디 찾기 요청 DTO를 내부 DTO로 변환
   */
  toFindIdDto(request: FindIdRequestDto, ipAddress?: string): FindIdDto {
    const dto = plainToInstance(
      FindIdDto,
      {
        ...request,
        ipAddress,
      },
      {
        excludeExtraneousValues: true,
      },
    )

    return dto
  }

  /**
   * 비밀번호 재설정 요청 DTO를 내부 DTO로 변환
   */
  toResetPasswordDto(request: ResetPasswordRequestDto, ipAddress?: string): ResetPasswordDto {
    const dto = plainToInstance(
      ResetPasswordDto,
      {
        ...request,
        ipAddress,
      },
      {
        excludeExtraneousValues: true,
      },
    )

    return dto
  }
}
