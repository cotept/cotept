import { TokenPair } from '@/modules/auth/domain/model';
import { SocialLoginDto, SocialProvider } from '@/modules/auth/application/dtos/social-login.dto';

/**
 * 소셜 로그인 유스케이스 인터페이스
 * 소셜 계정을 통한 로그인 기능을 정의합니다.
 */
export abstract class SocialLoginUseCase {
  /**
   * 소셜 로그인 처리
   * @param socialLoginDto 소셜 로그인 정보(제공자, 인증 코드, 리다이렉트 URI, IP, User-Agent)
   * @returns 액세스 토큰과 리프레시 토큰 쌍
   */
  abstract execute(socialLoginDto: SocialLoginDto): Promise<TokenPair>;
}
