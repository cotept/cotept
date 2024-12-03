import { AuthErrorMessage } from "@/common/constants/error.constants"
import { JwtPayload } from "@/common/interfaces/auth.interface"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"
import { AuthException } from "../exceptions/auth.exception"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    })
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new AuthException({
        code: "TOKEN_INVALID",
        message: AuthErrorMessage.AUTH.TOKEN.INVALID,
      })
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
