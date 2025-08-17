import { RefreshTokenDto } from '@/modules/auth/application/dtos/refresh-token.dto';
import { TokenPair } from '@/modules/auth/domain/model';

/**
 * 토큰 갱신 유스케이스 인터페이스
 * 리프레시 토큰을 통한 액세스 토큰 갱신 기능을 정의합니다.
 */
export abstract class RefreshTokenUseCase {
  /**
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰 발급
   * @param refreshTokenDto 토큰 갱신 정보(리프레시 토큰, IP, User-Agent)
   * @returns 새로운 액세스 토큰과 리프레시 토큰 쌍
   */
  abstract execute(refreshTokenDto: RefreshTokenDto): Promise<TokenPair>;
}
