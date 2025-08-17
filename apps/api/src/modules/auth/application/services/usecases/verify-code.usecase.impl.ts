// import { Injectable } from '@nestjs/common';
// import { VerifyCodeUseCase } from '@/modules/auth/application/ports/in/verify-code.usecase';
// import { VerifyCodeDto } from '@/modules/auth/application/dtos/verify-code.dto';
// import { AuthVerificationRepositoryPort } from '@/modules/auth/application/ports/out/auth-verification-repository.port';
// import { VerificationException } from '@/modules/auth/domain/model/auth-exception';

// /**
//  * 인증 코드 확인 유스케이스 구현체
//  */
// @Injectable()
// export class VerifyCodeUseCaseImpl implements VerifyCodeUseCase {
//   constructor(
//     private readonly authVerificationRepository: AuthVerificationRepositoryPort
//   ) {}

//   /**
//    * 인증 코드 검증
//    * @param dto 인증 코드 검증 정보(인증 ID, 코드)
//    * @returns 인증 성공 여부
//    */
//   async execute(dto: VerifyCodeDto): Promise<boolean> {
//     // 인증 객체 조회
//     const verification = await this.authVerificationRepository.findById(dto.verificationId);

//     // 인증 객체가 없는 경우
//     if (!verification) {
//       throw new VerificationException('유효하지 않은 인증 정보입니다.');
//     }

//     // 이미 인증된 경우
//     if (verification.verified) {
//       return true;
//     }

//     // 만료된 경우
//     if (verification.isExpired) {
//       throw new VerificationException('인증 시간이 만료되었습니다. 다시 시도해주세요.');
//     }

//     // 최대 시도 횟수(5회) 초과 검사
//     if (verification.attemptCount >= 5) {
//       throw new VerificationException('인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.');
//     }

//     // 인증 코드 검증
//     const isVerified = verification.verify(dto.code);

//     // 인증 성공 시 업데이트
//     if (isVerified) {
//       await this.authVerificationRepository.save(verification);
//     }

//     return isVerified;
//   }
// }
import { Injectable } from "@nestjs/common"

import { VerifyCodeDto } from "@/modules/auth/application/dtos/verify-code.dto"
import { VerifyCodeUseCase } from "@/modules/auth/application/ports/in/verify-code.usecase"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { VerificationException } from "@/modules/auth/domain/model/auth-exception"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"

@Injectable()
export class VerifyCodeUseCaseImpl implements VerifyCodeUseCase {
  constructor(
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly cacheService: CacheService, // 추가
  ) {}

  async execute(dto: VerifyCodeDto): Promise<boolean> {
    const redisKey = `verification:${dto.verificationId}`

    // 1. Redis에서 빠른 검증 시도
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
    const verification = await this.authVerificationRepository.findById(dto.verificationId)

    if (!verification) {
      throw new VerificationException("유효하지 않은 인증 정보입니다.")
    }

    // 이미 인증된 경우
    if (verification.verified) {
      return true
    }

    // 만료 확인
    if (verification.isExpired) {
      // Redis 데이터도 삭제
      await this.cacheService.delete(redisKey)
      throw new VerificationException("인증 시간이 만료되었습니다. 다시 시도해주세요.")
    }

    // 최대 시도 횟수 확인
    if (verification.attemptCount >= 5) {
      throw new VerificationException("인증 시도 횟수를 초과했습니다. 다시 인증 코드를 요청해주세요.")
    }

    // 도메인 모델의 verify 메서드 사용
    const isVerified = verification.verify(dto.code)

    // DB 업데이트 (도메인 모델의 상태 반영)
    await this.authVerificationRepository.save(verification)

    // Redis 업데이트 (일관성 유지)
    if (cachedData) {
      cachedData.attempts = verification.attemptCount
      cachedData.verified = verification.verified

      const ttl = await this.cacheService.getClient().ttl(redisKey)
      await this.cacheService.setObject(redisKey, cachedData, ttl > 0 ? ttl : 300)
    }

    // 인증 성공 시 Redis 데이터 삭제 (선택적)
    if (isVerified) {
      await this.cacheService.delete(redisKey)
    }

    return isVerified
  }
}
