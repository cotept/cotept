import { GenerateAuthCodeDto, GenerateAuthCodeResultDto } from "../../dtos/generate-auth-code.dto"

/**
 * 인증 코드 생성 유스케이스
 * 소셜 로그인 후 보안을 위한 임시 인증 코드를 생성합니다.
 */
export abstract class GenerateAuthCodeUseCase {
  /**
   * 인증 코드 생성 실행
   * @param dto 인증 코드 생성에 필요한 데이터
   * @returns 생성된 인증 코드 정보
   */
  abstract execute(dto: GenerateAuthCodeDto): Promise<GenerateAuthCodeResultDto>
}
