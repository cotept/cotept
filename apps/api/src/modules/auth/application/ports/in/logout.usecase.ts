import { LogoutDto } from '@/modules/auth/application/dtos/logout.dto';

/**
 * 로그아웃 유스케이스 인터페이스
 * 사용자 로그아웃 처리 기능을 정의합니다.
 */
export abstract class LogoutUseCase {
  /**
   * 사용자 로그아웃 처리
   * @param logoutDto 로그아웃 정보(사용자 ID, 토큰)
   */
  abstract execute(logoutDto: LogoutDto): Promise<void>;
}
