import { AuthErrorMessage } from "@/common/constants/error.constants"
import { RegistrationProgress } from "@/modules/users/entities/registration-progress.entity"
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { AuthException } from "../exceptions/auth.exception"

@Injectable()
export class RegistrationProgressGuard implements CanActivate {
  constructor(
    @InjectRepository(RegistrationProgress)
    private readonly registrationProgressRepository: Repository<RegistrationProgress>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { registrationId } = request.body

    if (!registrationId) {
      throw new AuthException({
        code: "REGISTRATION_ERROR",
        message: AuthErrorMessage.REGISTRATION.INVALID_PROGRESS_ID,
      })
    }

    const progress = await this.registrationProgressRepository.findOne({
      where: { id: registrationId },
    })

    if (!progress) {
      throw new AuthException({
        code: "REGISTRATION_ERROR",
        message: AuthErrorMessage.REGISTRATION.INVALID_PROGRESS_ID,
      })
    }

    if (progress.expiresAt < new Date()) {
      throw new AuthException({
        code: "REGISTRATION_ERROR",
        message: AuthErrorMessage.REGISTRATION.EXPIRED,
      })
    }

    request.registrationProgress = progress
    return true
  }
}
