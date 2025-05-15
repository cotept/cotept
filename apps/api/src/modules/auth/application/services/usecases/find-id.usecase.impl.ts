import { FindIdDto } from "@/modules/auth/application/dtos/find-id.dto"
import { FindIdUseCase } from "@/modules/auth/application/ports/in/find-id.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { VerificationException } from "@/modules/auth/domain/model/auth-exception"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { Injectable, Logger, NotFoundException } from "@nestjs/common"

@Injectable()
export class FindIdUseCaseImpl implements FindIdUseCase {
  private readonly logger = new Logger(FindIdUseCaseImpl.name)

  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 사용자 아이디(이메일) 찾기
   * @param findIdDto 아이디 찾기 정보(인증 타입, 인증 대상, 인증 ID 등)
   * @returns 마스킹된 이메일 주소
   */
  async execute(findIdDto: FindIdDto): Promise<{ email: string; maskingEmail: string }> {
    // 1. 인증 코드 검증
    const redisKey = `verification:${findIdDto.verificationId}`

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

    // 2. DB에서 실제 데이터 조회
    const verification = await this.authVerificationRepository.findById(findIdDto.verificationId)

    if (!verification) {
      throw new VerificationException("유효하지 않은 인증 정보입니다.")
    }

    // 이미 인증된 경우는 패스
    let isVerified = verification.verified

    // 아직 인증되지 않은 경우 코드 검증
    if (!isVerified) {
      // 만료 확인
      if (verification.isExpired) {
        // Redis 데이터도 삭제
        if (cachedData) await this.cacheService.delete(redisKey)
        throw new VerificationException("인증 시간이 만료되었습니다. 다시 시도해주세요.")
      }

      // 최대 시도 횟수 확인
      if (verification.attemptCount >= 5) {
        throw new VerificationException("인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.")
      }

      // 코드 및 다른 필드 확인
      if (
        verification.verificationCode !== findIdDto.verificationCode ||
        verification.authType !== findIdDto.authType ||
        verification.target !== findIdDto.target
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

        throw new VerificationException("인증 코드가 일치하지 않습니다.")
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
      throw new VerificationException("인증에 실패했습니다.")
    }

    // 2. 인증 타입에 따라 사용자 찾기
    let user: AuthUser | null = null

    if (findIdDto.authType === "EMAIL") {
      // 이메일로 사용자 찾기
      user = await this.authUserRepository.findByEmail(findIdDto.target)
    } else if (findIdDto.authType === "PHONE") {
      // 전화번호로 사용자 찾기 - 실제 레포지토리 메서드 사용
      user = await this.authUserRepository.findByPhoneNumber(findIdDto.target)
    }

    if (!user) {
      throw new NotFoundException("해당 정보와 일치하는 사용자를 찾을 수 없습니다.")
    }

    // 3. 이메일 마스킹 처리
    const email = user.getEmail()
    const maskingEmail = this.maskEmail(email)

    return {
      email,
      maskingEmail,
    }
  }

  /**
   * 이메일 마스킹 처리
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split("@")

    let maskedUsername = username
    if (username.length > 2) {
      maskedUsername = username.substring(0, 2) + "*".repeat(username.length - 2)
    } else if (username.length === 2) {
      maskedUsername = username.substring(0, 1) + "*"
    }

    return `${maskedUsername}@${domain}`
  }
}
