import { Injectable } from "@nestjs/common"

import { VerifyCodeDto } from "@/modules/auth/application/dtos/verify-code.dto"
import { VerifyCodeUseCase } from "@/modules/auth/application/ports/in/verify-code.usecase"
import { AuthCachePort } from "@/modules/auth/application/ports/out/auth-cache.port"
import { VerificationException } from "@/modules/auth/domain/model/auth-exception"

@Injectable()
export class VerifyCodeUseCaseImpl implements VerifyCodeUseCase {
  constructor(private readonly authCache: AuthCachePort) {}

  async execute(dto: VerifyCodeDto): Promise<boolean> {
    try {
      // AuthCache에서 verification 데이터 조회
      const cachedData = await this.authCache.getVerificationData<{
        code: string
        authType: string
        target: string
        userId?: number
        attempts: number
        verified: boolean
        expiresAt: string
      }>(dto.verificationId)

      // 인증 정보가 없는 경우
      if (!cachedData) {
        throw new VerificationException("유효하지 않은 인증 정보입니다.")
      }

      // 이미 인증된 경우
      if (cachedData.verified) {
        return true
      }

      // 만료 확인
      if (new Date(cachedData.expiresAt) < new Date()) {
        await this.authCache.deleteVerificationData(dto.verificationId)
        throw new VerificationException("인증 시간이 만료되었습니다. 다시 시도해주세요.")
      }

      // 최대 시도 횟수 확인
      if (cachedData.attempts >= 5) {
        throw new VerificationException("인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.")
      }

      // 인증 코드 비교
      if (cachedData.code !== dto.code) {
        // 시도 횟수 증가 - 원래 만료시간 유지
        const remainingTtl = Math.max(0, new Date(cachedData.expiresAt).getTime() - Date.now())
        cachedData.attempts++
        await this.authCache.saveVerificationData(dto.verificationId, cachedData, remainingTtl)

        throw new VerificationException("유효하지 않은 인증 정보입니다.")
      }

      // 인증 성공 - 10초 TTL로 중복 요청 방지
      cachedData.verified = true
      await this.authCache.saveVerificationData(dto.verificationId, cachedData, 10000) // 10초 TTL

      return true
    } catch (error) {
      if (error instanceof VerificationException) {
        throw error
      }

      // 기타 오류는 유효하지 않은 인증 정보로 처리
      throw new VerificationException("유효하지 않은 인증 정보입니다.")
    }
  }
}
