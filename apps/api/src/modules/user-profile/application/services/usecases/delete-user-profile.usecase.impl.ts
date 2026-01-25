import { Injectable, NotFoundException } from "@nestjs/common"

import { DeleteUserProfileUseCase } from "../../ports/in/delete-user-profile.usecase"
import { UserProfileRepositoryPort } from "../../ports/out/user-profile-repository.port"

@Injectable()
export class DeleteUserProfileUseCaseImpl implements DeleteUserProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepositoryPort) {}

  /**
   * 사용자 프로필 삭제
   * @param userId 삭제할 사용자 ID
   * @returns 삭제 성공 여부
   * @throws NotFoundException 프로필이 존재하지 않는 경우
   */
  async execute(userId: string): Promise<boolean> {
    // 1. 프로필 존재 여부 확인
    const profileExists = await this.userProfileRepository.existsByUserId(userId)
    if (!profileExists) {
      throw new NotFoundException(`사용자 ${userId}의 프로필을 찾을 수 없습니다.`)
    }

    // 2. 삭제 실행
    const deleted = await this.userProfileRepository.delete(userId)

    return deleted
  }
}
