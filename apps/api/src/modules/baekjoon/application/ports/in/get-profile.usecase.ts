import { BaekjoonProfileOutputDto, GetProfileInputDto } from "@/modules/baekjoon/application/dtos"

/**
 * 프로필 조회 유스케이스 포트
 * 백준 사용자 프로필을 조회하는 인바운드 포트
 */
export abstract class GetProfileUseCase {
  /**
   * 백준 사용자 프로필을 조회합니다
   */
  abstract execute(inputDto: GetProfileInputDto): Promise<BaekjoonProfileOutputDto>
  abstract executeByUserId(userId: string): Promise<BaekjoonProfileOutputDto>
}
