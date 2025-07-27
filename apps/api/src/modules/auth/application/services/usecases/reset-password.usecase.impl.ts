import { ResetPasswordDto } from "@/modules/auth/application/dtos/reset-password.dto"
import { ResetPasswordUseCase } from "@/modules/auth/application/ports/in/reset-password.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { LoginSessionRepositoryPort } from "@/modules/auth/application/ports/out/login-session-repository.port"
import { PasswordHasherPort } from "@/modules/auth/application/ports/out/password-hasher.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { ErrorUtils } from "@/shared/utils/error.util"
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common"

@Injectable()
export class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCaseImpl.name)

  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly cacheService: CacheService,
    private readonly loginSessionRepository: LoginSessionRepositoryPort,
  ) {}

  /**
   * 사용자 비밀번호 재설정
   * @param resetPasswordDto 비밀번호 재설정 정보(이메일, 인증 ID, 새 비밀번호 등)
   * @returns 성공 여부
   */
  async execute(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    // 1. 사용자 존재 확인
    const user = await this.authUserRepository.findByEmail(resetPasswordDto.email)
    if (!user) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND)
    }

    // 2. 인증 코드 검증
    const redisKey = `verification:${resetPasswordDto.verificationId}`

    // Redis에서 인증 정보 확인
    const cachedData = await this.cacheService.getObject<{
      code: string
      authType: string
      target: string
      userId?: string
      attempts: number
      verified: boolean
      expiresAt: string
    }>(redisKey)

    // DB에서 실제 데이터 조회
    const verification = await this.authVerificationRepository.findById(resetPasswordDto.verificationId)

    if (!verification) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.INVALID_VERIFICATION_DATA)
    }

    // 이미 인증된 경우는 패스
    let isVerified = verification.verified

    // 아직 인증되지 않은 경우 코드 검증
    if (!isVerified) {
      // 만료 확인
      if (verification.isExpired) {
        // Redis 데이터도 삭제
        if (cachedData) await this.cacheService.delete(redisKey)
        throw new BadRequestException(AUTH_ERROR_MESSAGES.VERIFICATION_CODE_EXPIRED)
      }

      // 최대 시도 횟수 확인
      if (verification.attemptCount >= 5) {
        throw new BadRequestException(AUTH_ERROR_MESSAGES.VERIFICATION_ATTEMPTS_EXCEEDED)
      }

      // 코드 및 이메일 일치 확인
      if (
        verification.verificationCode !== resetPasswordDto.verificationCode ||
        verification.target !== resetPasswordDto.email
      ) {
        // 실패 시도 횟수 증가
        verification.incrementAttemptCount()
        await this.authVerificationRepository.save(verification)

        // Redis 업데이트
        if (cachedData) {
          cachedData.attempts = verification.attemptCount
          const ttl = await this.cacheService.getClient().ttl(redisKey)
          await this.cacheService.setObject(redisKey, cachedData, ttl > 0 ? ttl : 300)
        }

        throw new BadRequestException(AUTH_ERROR_MESSAGES.VERIFICATION_CODE_MISMATCH)
      }

      // 인증 성공 처리
      verification.markAsVerified()
      await this.authVerificationRepository.save(verification)

      // Redis 업데이트
      if (cachedData) {
        cachedData.verified = true
        await this.cacheService.setObject(redisKey, cachedData, 300) // 5분 연장
      }

      isVerified = true
    }

    if (!isVerified) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.VERIFICATION_FAILED)
    }

    // 3. 비밀번호 변경 로직
    // 비밀번호 해싱
    const hashedPassword = await this.passwordHasher.hash(resetPasswordDto.newPassword)

    // 비밀번호 업데이트 - 이미 구현된 메서드 사용
    const updateResult = await this.authUserRepository.updatePassword(user.getId(), hashedPassword)

    if (!updateResult) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.PASSWORD_UPDATE_FAILED)
    }

    // 4. Redis 캐시 삭제 (비밀번호 변경 완료 후 인증 정보 삭제)
    await this.cacheService.delete(redisKey)

    // 5. 모든 활성 세션 종료 처리 (보안 강화를 위해)
    try {
      await this.loginSessionRepository.terminateAllUserSessions(user.getId())
    } catch (error) {
      // 세션 종료 실패는 비밀번호 변경 실패로 간주하지 않음
      this.logger.warn(
        `사용자 ${user.getId()}의 활성 세션 종료 중 오류 발생: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
    }

    return true
  }
}
