import { SendVerificationCodeDto } from "@/modules/auth/application/dtos/send-verification-code.dto"
import { SendVerificationCodeUseCase } from "@/modules/auth/application/ports/in/send-verification-code.usecase"
import { AuthVerificationRepositoryPort } from "@/modules/auth/application/ports/out/auth-verification-repository.port"
import { NotificationPort } from "@/modules/auth/application/ports/out/notification.port"
import { RateLimitExceededException, VerificationException } from "@/modules/auth/domain/model/auth-exception"
import { AuthVerification } from "@/modules/auth/domain/model/auth-verification"
import { Injectable } from "@nestjs/common"
import { v4 as uuid } from "uuid"

/**
 * 인증 코드 발송 유스케이스 구현체
 */
@Injectable()
export class SendVerificationCodeUseCaseImpl implements SendVerificationCodeUseCase {
  constructor(
    private readonly authVerificationRepository: AuthVerificationRepositoryPort,
    private readonly notificationService: NotificationPort,
  ) {}

  /**
   * 이메일 또는 SMS로 인증 코드 발송
   * @param dto 인증 코드 발송 정보(인증 타입, 대상, IP)
   * @returns 인증 결과 (인증 ID와 만료 시간)
   */
  async execute(dto: SendVerificationCodeDto): Promise<{ verificationId: string; expiresAt: Date }> {
    // 이전 인증 시도 확인 (도배 방지)
    const latestVerification = await this.authVerificationRepository.findLatestByTypeAndTarget(dto.authType, dto.target)

    // 최근 1분 이내 인증 시도가 있으면 제한
    if (latestVerification && this.isRecentlyRequested(latestVerification.createdAt)) {
      throw new RateLimitExceededException("인증 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.")
    }

    // 인증 객체 생성 (랜덤 코드 자동 생성)
    const verificationId = uuid()
    const authVerification = AuthVerification.create(
      verificationId,
      dto.userId || null,
      dto.authType,
      dto.target,
      dto.ipAddress || null,
      5, // 5분 유효
    )

    // 인증 DB에 저장
    await this.authVerificationRepository.save(authVerification)

    // 인증 타입에 따라 이메일 또는 SMS 발송
    let sendSuccess = false

    if (dto.authType === "EMAIL") {
      // 이메일 인증
      sendSuccess = await this.notificationService.sendEmail(
        dto.target,
        "코테피티 인증 코드",
        `인증 코드: ${authVerification.verificationCode}\n이 코드는 5분간 유효합니다.`,
        "EMAIL_VERIFICATION",
      )
    } else if (dto.authType === "PHONE" || dto.authType === "COMPANY") {
      // SMS 인증
      sendSuccess = await this.notificationService.sendSms(
        dto.target,
        `[코테피티] 인증번호: ${authVerification.verificationCode} (5분 유효)`,
        "SMS_VERIFICATION",
      )
    }

    // 발송 실패 시 예외 처리
    if (!sendSuccess) {
      throw new VerificationException("인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }

    // 인증 ID와 만료 시간 반환
    return {
      verificationId: authVerification.id,
      expiresAt: authVerification.expiresAt,
    }
  }

  /**
   * 최근 요청인지 확인 (1분 이내)
   */
  private isRecentlyRequested(date: Date): boolean {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = diffMs / 1000

    return diffSeconds < 60 // 1분(60초) 이내
  }
}
