import { Injectable } from "@nestjs/common"

import { SendVerificationCodeDto } from "@/modules/auth/application/dtos/send-verification-code.dto"
import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
import { AuthCachePort } from "@/modules/auth/application/ports/out/auth-cache.port"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { NotificationPort } from "@/modules/auth/application/ports/out/notification.port"
import { VerificationException } from "@/modules/auth/domain/model/auth-exception"
import { AuthVerification } from "@/modules/auth/domain/model/auth-verification"

@Injectable()
export class SendVerificationCodeUseCaseImpl implements SendVerificationCodeUseCase {
  constructor(
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly notificationService: NotificationPort,
    private readonly authCache: AuthCachePort,
  ) {}

  async execute(dto: SendVerificationCodeDto): Promise<{ verificationId: string; expiresAt: Date }> {
    // 기존 도메인 모델 활용
    const verificationId = Date.now() + Math.floor(Math.random() * 1000) // 타임스탬프 + 난수로 고유 ID 생성
    const expiresInMinutes = 5 // 도메인 비즈니스 규칙: 5분 만료
    const authVerification = AuthVerification.create(
      verificationId,
      dto.userId || null,
      dto.authType,
      dto.target,
      dto.ipAddress || null,
      expiresInMinutes,
    )

    // DB에 저장 (기존 로직 유지)
    await this.authVerificationRepository.save(authVerification)

    // AuthCache에 통합된 verification 데이터 저장
    const verificationData = {
      code: authVerification.verificationCode,
      authType: dto.authType,
      target: dto.target,
      userId: dto.userId || null,
      attempts: 0,
      verified: false,
      expiresAt: authVerification.expiresAt.toISOString(),
    }
    // 도메인에서 정의한 만료시간 사용 (5분 = 300초 = 300000밀리초)
    await this.authCache.saveVerificationData(verificationId.toString(), verificationData, 300000) // 5분

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
      // 실패 시 verification 데이터 삭제
      await this.authCache.deleteVerificationData(verificationId.toString())
      throw new VerificationException("인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }

    return {
      verificationId: verificationId.toString(),
      expiresAt: authVerification.expiresAt,
    }
  }
}
