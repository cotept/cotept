import { Injectable } from "@nestjs/common"

import { plainToInstance } from "class-transformer"

import { LoginDto } from "@/modules/auth/application/dtos/login.dto"
import { TokenPair } from "@/modules/auth/domain/model"

/**
 * 인증 매퍼
 * 인증 관련 도메인 객체와 DTO 간의 변환을 담당합니다.
 */
@Injectable()
export class AuthMapper {
  /**
   * 외부 요청 -> 로그인 DTO 변환
   */
  toLoginDto(request: any, metadata?: { ipAddress?: string; userAgent?: string }): LoginDto {
    const loginData = {
      ...request,
      ...metadata,
    }

    return plainToInstance(LoginDto, loginData, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * 토큰 쌍 -> 로그인 응답 객체 변환
   */
  toLoginResponse(tokenPair: TokenPair): any {
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: tokenPair.tokenType,
      expiresIn: tokenPair.accessToken,
    }
  }
}
