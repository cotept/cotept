import { AuthErrorMessage } from "@/common/constants/error.constants"
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthException } from "../exceptions/auth.exception"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new AuthException({
        code: "UNAUTHORIZED",
        message: AuthErrorMessage.AUTH.UNAUTHORIZED,
      })
    }
    return user
  }
}
