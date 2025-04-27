import { SocialTokenResponseDto } from "@/modules/auth/application/dtos/social-token-response.dto"
import { TokenPair, TokenPayload } from "@/modules/auth/domain/model"
import { Injectable } from "@nestjs/common"
import { plainToInstance } from "class-transformer"

/**
 * 토큰 매퍼
 * 도메인 값 객체와 애플리케이션 DTO 간의 변환을 담당합니다.
 */
@Injectable()
export class TokenMapper {
  /**
   * TokenPair 값 객체 -> SocialTokenResponseDto 변환
   * @param tokenPair 토큰 쌍 값 객체
   * @returns 소셜 토큰 응답 DTO
   */
  toSocialTokenResponseDto(tokenPair: TokenPair): SocialTokenResponseDto {
    const response = {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      tokenType: tokenPair.tokenType,
      expiresIn: tokenPair.accessToken,
    }

    return plainToInstance(SocialTokenResponseDto, response, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * SocialTokenResponseDto -> TokenPair 값 객체 변환
   * @param dto 소셜 토큰 응답 DTO
   * @returns 토큰 쌍 값 객체
   */
  // toTokenPair(dto: SocialTokenResponseDto): TokenPair {
  //   if (!dto.accessToken || !dto.refreshToken) {
  //     throw new Error("액세스 토큰과 리프레시 토큰은 필수입니다.")
  //   }

  //   return
  // }

  /**
   * 응답 객체 변환
   * @param tokenPair 토큰 쌍 값 객체
   * @returns 클라이언트 응답용 객체
   */
  toResponse(tokenPair: TokenPair): any {
    return tokenPair.toResponseObject()
  }

  /**
   * JWT 검증으로 받은 raw payload -> TokenPayload 도메인 객체 변환
   * @param rawPayload JWT 검증으로 얻은 원시 페이로드 객체
   * @returns TokenPayload 도메인 객체
   */
  toTokenPayload(rawPayload: Record<string, any>): TokenPayload {
    if (!rawPayload || !rawPayload.sub) {
      throw new Error("유효하지 않은 토큰 페이로드입니다.")
    }

    return TokenPayload.fromJwtPayload(rawPayload)
  }
}
