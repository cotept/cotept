import { ValidateAuthCodeDto, ValidateAuthCodeResultDto } from "../../dtos/validate-auth-code.dto"

/**
 * 인증 코드 검증 유스케이스
 * 소셜 로그인 후 발급된 임시 인증 코드의 유효성을 검증합니다.
 */
export abstract class ValidateAuthCodeUseCase {
  /**
   * 인증 코드 검증 실행
   * @param dto 검증할 인증 코드 정보
   * @returns 검증 결과 및 사용자 ID
   */
  abstract execute(dto: ValidateAuthCodeDto): Promise<ValidateAuthCodeResultDto>
}
