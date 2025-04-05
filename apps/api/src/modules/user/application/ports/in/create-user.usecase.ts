import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"

/**
 * 사용자 생성 유스케이스 인터페이스
 * 이 포트는 외부에서 새 사용자를 생성하는 기능을 정의합니다.
 */
export abstract class CreateUserUseCase {
  /**
   * 새 사용자 생성
   * @param createUserDto 생성할 사용자 정보
   * @returns 생성된 사용자 정보 DTO
   */
  abstract execute(createUserDto: CreateUserDto): Promise<UserDto>
}
