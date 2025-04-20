import { TokenPayload } from '@/modules/auth/domain/model';
import { ValidateTokenDto } from '@/modules/auth/application/dtos/validate-token.dto';

/**
 * 토큰 검증 유스케이스 인터페이스
 * JWT 토큰의 유효성을 검증하고 페이로드를 추출하는 기능을 정의합니다.
 */
export abstract class ValidateTokenUseCase {
  /**
   * JWT 토큰 검증 및 페이로드 추출
   * @param validateTokenDto 토큰 검증 정보(토큰)
   * @returns 토큰 페이로드 또는 null(유효하지 않은 토큰)
   */
  abstract execute(validateTokenDto: ValidateTokenDto): Promise<TokenPayload | null>;
}
