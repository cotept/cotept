import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SocialProfileDto } from '@/modules/auth/application/dtos/social-profile.dto';

/**
 * 소셜 프로필 매퍼
 * 외부 API에서 받은 소셜 프로필 데이터를 애플리케이션 DTO로 변환합니다.
 */
@Injectable()
export class SocialProfileMapper {
  /**
   * 외부 소셜 API 응답 -> 소셜 프로필 DTO 변환
   * @param data 소셜 API 응답 데이터
   * @param provider 소셜 제공자
   * @param tokens 액세스 토큰 및 리프레시 토큰
   * @returns 소셜 프로필 DTO
   */
  toDto(
    data: any,
    provider: string,
    tokens?: { accessToken?: string; refreshToken?: string }
  ): SocialProfileDto {
    let profileData: Partial<SocialProfileDto> = {
      provider: provider as any,
      raw: data
    };

    // 소셜 제공자별로 다른 응답 구조 처리
    switch (provider) {
      case 'google':
        profileData = {
          ...profileData,
          id: data.sub || data.id,
          email: data.email,
          name: data.name,
          profileImageUrl: data.picture
        };
        break;
      case 'kakao':
        profileData = {
          ...profileData,
          id: data.id?.toString(),
          email: data.kakao_account?.email,
          name: data.kakao_account?.profile?.nickname,
          profileImageUrl: data.kakao_account?.profile?.profile_image_url
        };
        break;
      case 'naver':
        profileData = {
          ...profileData,
          id: data.response?.id,
          email: data.response?.email,
          name: data.response?.name,
          profileImageUrl: data.response?.profile_image
        };
        break;
      case 'github':
        profileData = {
          ...profileData,
          id: data.id?.toString(),
          email: data.email,
          name: data.name || data.login,
          profileImageUrl: data.avatar_url
        };
        break;
      default:
        // 기본 매핑 (일반적인 필드 이름 가정)
        profileData = {
          ...profileData,
          id: data.id?.toString() || data.sub,
          email: data.email,
          name: data.name || data.displayName,
          profileImageUrl: data.picture || data.avatar || data.profile_image
        };
    }

    // 토큰 정보 추가
    if (tokens) {
      profileData.accessToken = tokens.accessToken;
      profileData.refreshToken = tokens.refreshToken;
    }

    return plainToInstance(SocialProfileDto, profileData, {
      excludeExtraneousValues: true
    });
  }

  /**
   * DTO -> 응답 객체 변환 (민감한 정보 제외)
   */
  toResponse(dto: SocialProfileDto): any {
    // raw 데이터와 토큰 정보는 민감하므로 응답에서 제외
    const { raw, accessToken, refreshToken, ...safeData } = dto;
    return safeData;
  }
}
