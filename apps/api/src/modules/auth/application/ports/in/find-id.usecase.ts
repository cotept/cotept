import { FindIdDto } from "@/modules/auth/application/dtos/find-id.dto"

/**
 * 아이디 찾기 유스케이스 인터페이스
 * 인증된 이메일 또는 전화번호를 통해 사용자 이메일(아이디)를 찾는 기능을 정의합니다.
 */
export abstract class FindIdUseCase {
  /**
   * 사용자 아이디(이메일) 찾기
   * @param findIdDto 아이디 찾기 정보(인증 타입, 인증 대상, 인증 ID 등)
   * @returns 마스킹된 이메일 주소
   */
  abstract execute(findIdDto: FindIdDto): Promise<{ email: string; maskingEmail: string }>
}
