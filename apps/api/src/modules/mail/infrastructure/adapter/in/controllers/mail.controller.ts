import { MailFacadeService } from "@/modules/mail/application/services/facade/mail-facade.service"
import { MailRequestMapper } from "@/modules/mail/infrastructure/adapter/in/mappers/mail-request.mapper"
import { MailRequestDto } from "@/modules/mail/infrastructure/dtos/request/mail-request.dto"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"

@ApiTags("메일")
@Controller("mail")
export class MailController {
  private readonly logger = new Logger(MailController.name)

  constructor(private readonly mailFacadeService: MailFacadeService) {}

  @Post("email-verification")
  @ApiOperation({ summary: "이메일 본인확인" })
  async sendEmailVerification(@Body() requestDto: MailRequestDto): Promise<void> {
    this.logger.log("sendEmailVerification", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"email_verification">(requestDto)
    return await this.mailFacadeService.sendEmailVerification(sendMailDtoAlt)
  }

  @Post("password-recovery")
  @ApiOperation({ summary: "비밀번호 찾기" })
  async sendPasswordRecovery(@Body() requestDto: MailRequestDto): Promise<void> {
    this.logger.log("sendPasswordRecovery", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"password_recovery">(requestDto)
    return await this.mailFacadeService.sendPasswordRecovery(sendMailDtoAlt)
  }

  @Post("verification-code")
  @ApiOperation({ summary: "인증번호 발송" })
  async sendVerificationCode(@Body() requestDto: MailRequestDto): Promise<void> {
    this.logger.log("sendVerificationCode", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"verification_code">(requestDto)
    return await this.mailFacadeService.sendVerificationCode(sendMailDtoAlt)
  }

  @Post("reservation-create")
  @ApiOperation({ summary: "멘토링 예약 신청" })
  async sendReservationCreate(
    @Body()
    requestDto: MailRequestDto,
  ): Promise<void> {
    this.logger.log("sendReservationCreate", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"reservation_create">(requestDto)
    return await this.mailFacadeService.sendReservationCreate(sendMailDtoAlt)
  }

  @Post("reservation-fix")
  @ApiOperation({ summary: "멘토링 예약 확정" })
  async sendReservationFix(
    @Body()
    requestDto: MailRequestDto,
  ): Promise<void> {
    this.logger.log("sendReservationFix", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"reservation_fix">(requestDto)
    return await this.mailFacadeService.sendReservationFix(sendMailDtoAlt)
  }

  @Post("reservation-cancel")
  @ApiOperation({ summary: "멘토링 예약 취소" })
  async sendReservationCancel(
    @Body()
    requestDto: MailRequestDto,
  ): Promise<void> {
    this.logger.log("sendReservationCancel", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"reservation_cancel">(requestDto)
    return await this.mailFacadeService.sendReservationCancel(sendMailDtoAlt)
  }

  @Post("reservation-change")
  @ApiOperation({ summary: "멘토링 예약 변경" })
  async sendReservationChange(
    @Body()
    requestDto: MailRequestDto,
  ): Promise<void> {
    this.logger.log("sendReservationChange", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"reservation_change">(requestDto)
    return await this.mailFacadeService.sendReservationChange(sendMailDtoAlt)
  }

  @Post("reservation-prenotice")
  @ApiOperation({ summary: "멘토링 사전안내" })
  async sendReservationPrenotice(
    @Body()
    requestDto: MailRequestDto,
  ): Promise<void> {
    this.logger.log("sendReservationPrenotice", { requestDto })
    const sendMailDtoAlt = MailRequestMapper.toSendMailDtoWithTransformer<"reservation_prenotice">(requestDto)
    return await this.mailFacadeService.sendReservationPrenotice(sendMailDtoAlt)
  }
}
