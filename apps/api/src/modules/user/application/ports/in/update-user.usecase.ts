import { UpdateUserDto } from "@/modules/user/application/dto/update-user.dto"
import { UserDto } from "@/modules/user/application/dto/user.dto"

/**
 * 사용자 정보 업데이트 유스케이스 인터페이스
 * 이 포트는 외부에서 사용자 정보를 업데이트하는 기능을 정의합니다.
 */
export abstract class UpdateUserUseCase {
  /**
   * 사용자 정보 업데이트
   * @param idx 사용자 IDX
   * @param updateUserDto 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 정보 DTO
   */
  abstract execute(idx: number, updateUserDto: UpdateUserDto): Promise<UserDto>
}
