import { SelectProfileDto } from "@/modules/auth/application/dtos/select-profile.dto"
import { TokenPair } from "@/modules/auth/domain/model/token-pair"

/**
 * 프로필 타입 선택 유스케이스 포트
 * 멘토 사용자가 사용할 프로필(mentee/mentor)을 선택하여
 * activeProfile 메타데이터가 포함된 새로운 Access Token을 발급받습니다.
 */
export abstract class SelectProfileUseCase {
  /**
   * 프로필 선택 및 토큰 갱신
   * @param selectProfileDto 프로필 선택 정보 (userId, activeProfile)
   * @returns activeProfile 메타데이터가 포함된 새로운 TokenPair
   */
  abstract execute(selectProfileDto: SelectProfileDto): Promise<TokenPair>
}
