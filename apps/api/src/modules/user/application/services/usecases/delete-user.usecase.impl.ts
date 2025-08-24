import { Injectable, NotFoundException } from "@nestjs/common"

import { DeleteUserDto } from "@/modules/user/application/dto/delete-user.dto"
import { DeleteUserUseCase } from "@/modules/user/application/ports/in/delete-user.usecase"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"

@Injectable()
export class DeleteUserUseCaseImpl implements DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * 사용자 삭제
   * @param idx 삭제할 사용자 ID
   * @param deleteUserDto 삭제 관련 추가 정보 (선택적)
   * @returns 삭제 성공 여부
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   */
  async execute(idx: number, deleteUserDto?: DeleteUserDto): Promise<boolean> {
    // 사용자 존재 여부 확인
    const user = await this.userRepository.findByIdx(idx)
    if (!user) {
      throw new NotFoundException(`ID ${idx}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    // 기본 옵션 설정
    const options: DeleteUserDto = {
      deleteType: deleteUserDto?.deleteType || "SOFT",
      deleteRelatedData: deleteUserDto?.deleteRelatedData || false,
      reason: deleteUserDto?.reason,
      userId: deleteUserDto?.userId as string,
    }

    // 사용자 삭제
    return this.userRepository.delete(idx, options)
  }
}
