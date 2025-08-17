import { ConflictException, Injectable } from "@nestjs/common"

import { CreateUserDto } from "@/modules/user/application/dtos/create-user.dto"
import { UserDto } from "@/modules/user/application/dtos/user.dto"
import { UserMapper } from "@/modules/user/application/mappers/user.mapper"
import { CreateUserUseCase } from "@/modules/user/application/ports/in/create-user.usecase"
import { PasswordServicePort } from "@/modules/user/application/ports/out/password-service.port"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import User, { UserRole } from "@/modules/user/domain/model/user"
import { Email } from "@/modules/user/domain/vo/email.vo"
import { Name } from "@/modules/user/domain/vo/name.vo"
import { PhoneNumber } from "@/modules/user/domain/vo/phone-number.vo"

@Injectable()
export class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordService: PasswordServicePort,
    private readonly userMapper: UserMapper,
  ) {}

  /**
   * 새 사용자 생성
   * @param createUserDto 생성할 사용자 정보
   * @returns 생성된 사용자 정보 DTO
   * @throws ConflictException 이메일이 이미 사용 중인 경우
   * @throws BadRequestException 비밀번호 정책을 위반하는 경우
   */
  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    // 이메일 중복 체크
    const emailExists = await this.userRepository.existsByEmail(createUserDto.email)
    if (emailExists) {
      throw new ConflictException(`이메일 ${createUserDto.email}은(는) 이미 사용 중입니다.`)
    }

    // 비밀번호 해싱
    const { hash, salt } = await this.passwordService.hashPassword(createUserDto.password)

    // 값 객체 생성
    const email = Email.of(createUserDto.email)
    const name = createUserDto.name ? Name.of(createUserDto.name) : undefined
    const phoneNumber = createUserDto.phoneNumber ? PhoneNumber.of(createUserDto.phoneNumber) : undefined

    // 도메인 엔티티 생성
    const user = User.createWithBasicAuth({
      email,
      passwordHash: hash,
      salt,
      role: (createUserDto.role as UserRole) || UserRole.MENTEE,
      name,
      phoneNumber,
    })

    // 저장
    const savedUser = await this.userRepository.save(user)

    // DTO로 변환하여 반환
    return this.userMapper.toDto(savedUser)
  }
}
