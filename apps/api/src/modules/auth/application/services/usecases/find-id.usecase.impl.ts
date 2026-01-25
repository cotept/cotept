import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"

import { FindIdDto } from "@/modules/auth/application/dtos/find-id.dto"
import { FindIdUseCase } from "@/modules/auth/application/ports/in/find-id.usecase"
import { AuthUserRepositoryPort } from "@/modules/auth/application/ports/out/auth-user-repository.port"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { AUTH_ERROR_MESSAGES } from "@/modules/auth/domain/constants/auth-error-messages"
import { AuthUser } from "@/modules/auth/domain/model/auth-user"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"
import { convertDomainUserIdToString } from "@/shared/utils/auth-type-converter.util"

@Injectable()
export class FindIdUseCaseImpl implements FindIdUseCase {
  private readonly logger = new Logger(FindIdUseCaseImpl.name)

  constructor(
    private readonly authUserRepository: AuthUserRepositoryPort,
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 사용자 아이디 찾기
   * @param findIdDto 아이디 찾기 정보(인증 타입, 인증 대상, 인증 ID 등)
   * @returns 마스킹된 아이디
   */
  async execute(findIdDto: FindIdDto): Promise<{ id: string; maskingId: string }> {
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
      throw new NotFoundException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND)
    }

    // 3. 아이디 마스킹 처리
    const id = convertDomainUserIdToString(user.getId())
    const maskingId = this.maskId(id)

    return {
      id,
      maskingId,
    }
  }

  /**
   * 아이디 마스킹 처리
   */
  private maskId(id: string): string {
    if (id.length <= 2) {
      return id.substring(0, 1) + "*"
    } else if (id.length <= 4) {
      return id.substring(0, 2) + "*".repeat(id.length - 2)
    } else {
      return id.substring(0, 3) + "*".repeat(id.length - 3)
    }
  }
}
