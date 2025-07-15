import { Injectable, Logger } from "@nestjs/common"
import { MailerService } from "@nestjs-modules/mailer"

import { SendMailDto } from "../../dtos/send-mail.dto"
import { SendMailUseCase } from "../../ports/in/send-mail.usecase"

import { TemplateNames } from "@/modules/mail/domain/types/template.types"

@Injectable()
export class MailFacadeService {
  private readonly logger = new Logger(MailFacadeService.name)

  constructor(
    private readonly mailerService: MailerService,
    private readonly sendMailUseCase: SendMailUseCase,
  ) {}

  /**
   * 일반 메일 전송
   */
  async sendMail<T extends TemplateNames>(dto: SendMailDto<T>): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 이메일 인증 메일 전송
   */
  async sendEmailVerification(dto: SendMailDto<"email_verification">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 비밀번호 찾기 메일 전송
   */
  async sendPasswordRecovery(dto: SendMailDto<"password_recovery">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 인증번호 전송
   */
  async sendVerificationCode(dto: SendMailDto<"verification_code">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 멘토링 예약 신청 메일 전송
   */
  async sendReservationCreate(dto: SendMailDto<"reservation_create">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 멘토링 예약 확정 메일 전송
   */
  async sendReservationFix(dto: SendMailDto<"reservation_fix">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 멘토링 예약 취소 메일 전송
   */
  async sendReservationCancel(dto: SendMailDto<"reservation_cancel">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 멘토링 예약 변경 메일 전송
   */
  async sendReservationChange(dto: SendMailDto<"reservation_change">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }

  /**
   * 멘토링 사전안내 메일 전송
   */
  async sendReservationPrenotice(dto: SendMailDto<"reservation_prenotice">): Promise<void> {
    return await this.sendMailUseCase.execute(dto)
  }
}
