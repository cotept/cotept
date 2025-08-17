import { Injectable, NotFoundException } from "@nestjs/common"

import { UpdateUserDto } from "@/modules/user/application/dtos/update-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { UpdateUserUseCase } from "@/modules/user/application/ports/in/update-user.usecase"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"
import { sanitizeInput } from "@/shared/utils"

@Injectable()
export class UpdateUserUseCaseImpl implements UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * 사용자 정보 업데이트
   * @param id 사용자 ID
   * @param updateUserDto 업데이트할 사용자 정보
   * @returns 업데이트된 사용자 정보 DTO
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   */
  async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // 사용자 조회
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`)
    }
    // 값 객체 생성
    const nameInput = sanitizeInput(updateUserDto.name)
    const phoneInput = sanitizeInput(updateUserDto.phoneNumber)
    const name = nameInput ? Name.of(nameInput) : undefined
    const phoneNumber = phoneInput ? PhoneNumber.of(phoneInput) : undefined

    // 도메인 엔티티 업데이트
    if (name !== undefined || phoneNumber !== undefined) {
      user.updateBasicInfo({
        name: name !== undefined ? name : undefined,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
      })
    }

    // 상태 업데이트
    if (updateUserDto.status !== undefined) {
      user.updateStatus(updateUserDto.status as any)
    }

    // 전화번호 인증 상태 업데이트
    if (updateUserDto.phoneVerified !== undefined && user.phoneNumber) {
      user.setPhoneVerified(updateUserDto.phoneVerified)
    }

    // 저장
    const savedUser = await this.userRepository.save(user)

    // DTO로 변환하여 반환
    return this.userMapper.toDto(savedUser)
  }
}
