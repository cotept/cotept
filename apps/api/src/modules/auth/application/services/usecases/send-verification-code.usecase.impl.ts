// import { SendVerificationCodeDto } from "@/modules/auth/application/dtos/send-verification-code.dto"
// import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
// import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
// import { NotificationPort } from "@/modules/auth/application/ports/out/notification.port"
// import { RateLimitExceededException, VerificationException } from "@/modules/auth/domain/model/auth-exception"
// import { AuthVerification } from "@/modules/auth/domain/model/auth-verification"
// import { Injectable } from "@nestjs/common"
// import { v4 as uuid } from "uuid"

// /**
//  * 인증 코드 발송 유스케이스 구현체
//  */
// @Injectable()
// export class SendVerificationCodeUseCaseImpl implements SendVerificationCodeUseCase {
//   constructor(
//     private readonly authVerificationRepository: AuthVerificationRepositoryPort,
//     private readonly notificationService: NotificationPort,
//   ) {}

//   /**
//    * 이메일 또는 SMS로 인증 코드 발송
//    * @param dto 인증 코드 발송 정보(인증 타입, 대상, IP)
//    * @returns 인증 결과 (인증 ID와 만료 시간)
//    */
//   async execute(dto: SendVerificationCodeDto): Promise<{ verificationId: string; expiresAt: Date }> {
//     // 이전 인증 시도 확인 (도배 방지)
//     const latestVerification = await this.authVerificationRepository.findLatestByTypeAndTarget(dto.authType, dto.target)

//     // 최근 1분 이내 인증 시도가 있으면 제한
//     if (latestVerification && this.isRecentlyRequested(latestVerification.createdAt)) {
//       throw new RateLimitExceededException("인증 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.")
//     }

//     // 인증 객체 생성 (랜덤 코드 자동 생성)
//     const verificationId = uuid()
//     const authVerification = AuthVerification.create(
//       verificationId,
//       dto.userId || null,
//       dto.authType,
//       dto.target,
//       dto.ipAddress || null,
//       5, // 5분 유효
//     )

//     // 인증 DB에 저장
//     await this.authVerificationRepository.save(authVerification)

//     // 인증 타입에 따라 이메일 또는 SMS 발송
//     let sendSuccess = false

//     if (dto.authType === "EMAIL") {
//       // 이메일 인증
//       sendSuccess = await this.notificationService.sendEmail(
//         dto.target,
//         "코테피티 인증 코드",
//         `인증 코드: ${authVerification.verificationCode}\n이 코드는 5분간 유효합니다.`,
//         "EMAIL_VERIFICATION",
//       )
//     } else if (dto.authType === "PHONE" || dto.authType === "COMPANY") {
//       // SMS 인증
//       sendSuccess = await this.notificationService.sendSms(
//         dto.target,
//         `[코테피티] 인증번호: ${authVerification.verificationCode} (5분 유효)`,
//         "SMS_VERIFICATION",
//       )
//     }

//     // 발송 실패 시 예외 처리
//     if (!sendSuccess) {
//       throw new VerificationException("인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
//     }

//     // 인증 ID와 만료 시간 반환
//     return {
//       verificationId: authVerification.id,
//       expiresAt: authVerification.expiresAt,
//     }
//   }

//   /**
//    * 최근 요청인지 확인 (1분 이내)
//    */
//   private isRecentlyRequested(date: Date): boolean {
//     const now = new Date()
//     const diffMs = now.getTime() - date.getTime()
//     const diffSeconds = diffMs / 1000

//     return diffSeconds < 60 // 1분(60초) 이내
//   }
// }
import { Injectable } from "@nestjs/common"

import { v4 as uuid } from "uuid"

import { SendVerificationCodeDto } from "@/modules/auth/application/dtos/send-verification-code.dto"
import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { NotificationPort } from "@/modules/auth/application/ports/out/notification.port"
import { RateLimitExceededException, VerificationException } from "@/modules/auth/domain/model/auth-exception"
import { AuthVerification } from "@/modules/auth/domain/model/auth-verification"
import { CacheService } from "@/shared/infrastructure/cache/redis/cache.service"

@Injectable()
export class SendVerificationCodeUseCaseImpl implements SendVerificationCodeUseCase {
  constructor(
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly notificationService: NotificationPort,
    private readonly cacheService: CacheService, // 추가
  ) {}

  async execute(dto: SendVerificationCodeDto): Promise<{ verificationId: string; expiresAt: Date }> {
    // Redis로 속도 제한 확인
    const recentRequestKey = `verification_cooldown:${dto.authType}:${dto.target}`
    const hasRecentRequest = await this.cacheService.exists(recentRequestKey)

    if (hasRecentRequest) {
      throw new RateLimitExceededException("인증 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.")
    }

    // 기존 도메인 모델 활용
    const verificationId = uuid()
    const authVerification = AuthVerification.create(
      verificationId,
      dto.userId || null,
      dto.authType,
      dto.target,
      dto.ipAddress || null,
      5, // 5분 유효
    )

    // DB에 저장 (기존 로직 유지)
    await this.authVerificationRepository.save(authVerification)

    // Redis에 인증 코드 캐싱 (빠른 조회용)
    const redisKey = `verification:${verificationId}`
    await this.cacheService.setObject(
      redisKey,
      {
        code: authVerification.verificationCode,
        authType: dto.authType,
        target: dto.target,
        userId: dto.userId,
        attempts: 0,
        verified: false,
        expiresAt: authVerification.expiresAt.toISOString(),
      },
      300,
    ) // 5분 TTL

    // 쿨다운 설정
    await this.cacheService.set(recentRequestKey, "true", 60)

    // 이메일/SMS 발송
    let sendSuccess = false

    if (dto.authType === "EMAIL") {
      sendSuccess = await this.notificationService.sendEmail({
        to: dto.target,
        template: "verification_code",
        data: { authNumber: authVerification.verificationCode },
      })
    } else if (dto.authType === "PHONE" || dto.authType === "COMPANY") {
      sendSuccess = await this.notificationService.sendSms(
        dto.target,
        `[코테피티] 인증번호: ${authVerification.verificationCode} (5분 유효)`,
        "SMS_VERIFICATION",
      )
    }

    if (!sendSuccess) {
      // 실패 시 Redis 데이터 삭제
      await this.cacheService.delete(redisKey)
      throw new VerificationException("인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }

    return {
      verificationId: authVerification.id,
      expiresAt: authVerification.expiresAt,
    }
  }
}
