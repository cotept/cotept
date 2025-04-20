import { ChangePasswordDto } from "@/modules/user/application/dtos/change-password.dto"
import { ChangePasswordUseCase } from "@/modules/user/application/ports/in/change-password.usecase"
import { PasswordServicePort } from "@/modules/user/application/ports/out/password-service.port"
import { UserRepositoryPort } from "@/modules/user/application/ports/out/user-repository.port"
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class ChangePasswordUseCaseImpl implements ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordService: PasswordServicePort,
  ) {}

  /**
   * 비밀번호 변경
   * @param userId 사용자 ID
   * @param changePasswordDto 비밀번호 변경 정보
   * @returns 비밀번호 변경 성공 여부
   * @throws NotFoundException 사용자가 존재하지 않는 경우
   * @throws UnauthorizedException 현재 비밀번호가 일치하지 않는 경우
   * @throws BadRequestException 새 비밀번호가 정책을 위반하거나 확인과 일치하지 않는 경우
   */
  async execute(userId: string, changePasswordDto: ChangePasswordDto): Promise<boolean> {
    // 사용자 조회
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundException(`ID ${userId}에 해당하는 사용자를 찾을 수 없습니다.`)
    }

    // 현재 비밀번호 검증
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    )

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("현재 비밀번호가 일치하지 않습니다.")
    }

    // 새 비밀번호와 확인 비밀번호 일치 여부 확인
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
    }

    // 새 비밀번호와 기존 비밀번호가 같은지 확인
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException("새 비밀번호는 현재 비밀번호와 달라야 합니다.")
    }

    // 새 비밀번호 해싱
    const { hash, salt } = await this.passwordService.hashPassword(changePasswordDto.newPassword)

    // 비밀번호 업데이트
    user.passwordHash = hash
    user.salt = salt

    // 변경 사항 저장
    await this.userRepository.save(user)

    return true
  }
}
