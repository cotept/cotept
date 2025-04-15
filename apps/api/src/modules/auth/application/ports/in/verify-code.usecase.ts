import { VerifyCodeDto } from '@/modules/auth/application/dtos/verify-code.dto';

/**
 * 인증 코드 확인 유스케이스 인터페이스
 * 이메일 또는 SMS로 발송된 인증 코드를 확인하는 기능을 정의합니다.
 */
export abstract class VerifyCodeUseCase {
  /**
   * 인증 코드 검증
   * @param verifyCodeDto 인증 코드 검증 정보(인증 ID, 코드)
   * @returns 인증 성공 여부
   */
  abstract execute(verifyCodeDto: VerifyCodeDto): Promise<boolean>;
}
