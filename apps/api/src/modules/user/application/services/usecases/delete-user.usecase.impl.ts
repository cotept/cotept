import { DeleteUserUseCase } from "@/modules/user/application/ports/in/delete-user.usecase"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { DeleteUserDto } from "@/modules/user/application/dtos/delete-user.dto"
import { Injectable, NotFoundException } from "@nestjs/common"

@Injectable()
export class DeleteUserUseCaseImpl implements DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * 사용자 삭제
   * @param id 삭제할 사용자 ID
   * @param deleteUserDto 삭제 관련 추가 정보 (선택적)
   * @returns 삭제 성공 여부
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   */
  async execute(id: string, deleteUserDto?: DeleteUserDto): Promise<boolean> {
    // 사용자 존재 여부 확인
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }
    
    // 사용자 삭제
    return this.userRepository.delete(id)
  }
}
