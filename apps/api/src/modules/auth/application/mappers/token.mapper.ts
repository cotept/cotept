import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Token, TokenPair } from '@/modules/auth/domain/vo';
import { SocialTokenResponseDto } from '@/modules/auth/application/dtos/social-token-response.dto';

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
      accessToken: tokenPair.accessToken.value,
      refreshToken: tokenPair.refreshToken.value,
      tokenType: tokenPair.tokenType,
      expiresIn: tokenPair.accessToken.timeToExpire()
    };

    return plainToInstance(SocialTokenResponseDto, response, {
      excludeExtraneousValues: true
    });
  }

  /**
   * SocialTokenResponseDto -> TokenPair 값 객체 변환
   * @param dto 소셜 토큰 응답 DTO
   * @returns 토큰 쌍 값 객체
   */
  toTokenPair(dto: SocialTokenResponseDto): TokenPair {
    if (!dto.accessToken || !dto.refreshToken) {
      throw new Error('액세스 토큰과 리프레시 토큰은 필수입니다.');
    }

    // 만료 시간 계산
    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + (dto.expiresIn || 3600) * 1000);
    
    // 리프레시 토큰은 액세스 토큰보다 오래 유지 (일반적으로 7일)
    const refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = new Token(dto.accessToken, accessTokenExpiresAt);
    const refreshToken = new Token(dto.refreshToken, refreshTokenExpiresAt);

    return new TokenPair(
      accessToken,
      refreshToken,
      dto.tokenType || 'Bearer'
    );
  }

  /**
   * 응답 객체 변환
   * @param tokenPair 토큰 쌍 값 객체
   * @returns 클라이언트 응답용 객체
   */
  toResponse(tokenPair: TokenPair): any {
    return tokenPair.toResponseObject();
  }
}
