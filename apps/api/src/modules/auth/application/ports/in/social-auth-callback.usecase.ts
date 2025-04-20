import { SocialAuthCallbackDto, SocialAuthCallbackResponseDto } from '@/modules/auth/application/dtos/social-auth-callback.dto';

/**
 * 소셜 인증 콜백 처리 유스케이스 인터페이스
 * PassportJS에서 처리된 사용자 정보를 활용해 인증 및 토큰 생성 절차를 정의합니다.
 */
export abstract class SocialAuthCallbackUseCase {
  /**
   * 소셜 인증 콜백 처리
   * @param callbackDto 콜백 처리에 필요한 데이터(인증된 사용자 정보, IP, User-Agent, 리다이렉트 URL 등)
   * @returns 리다이렉트 URL 정보가 포함된 객체
   */
  abstract execute(callbackDto: SocialAuthCallbackDto): Promise<SocialAuthCallbackResponseDto>;
}
