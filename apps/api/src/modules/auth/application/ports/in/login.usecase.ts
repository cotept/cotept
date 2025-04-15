import { TokenPair } from '@/modules/auth/domain/model';
import { LoginDto } from '@/modules/auth/application/dtos/login.dto';

/**
 * 로그인 유스케이스 인터페이스
 * 사용자 로그인 및 토큰 발급 기능을 정의합니다.
 */
export abstract class LoginUseCase {
  /**
   * 이메일과 비밀번호로 사용자를 인증하고 토큰 발급
   * @param loginDto 로그인 정보(이메일, 비밀번호, IP, User-Agent)
   * @returns 액세스 토큰과 리프레시 토큰 쌍
   */
  abstract execute(loginDto: LoginDto): Promise<TokenPair>;
}
