//
import { AuthErrorMessage } from "@/common/constants/error.constants"
import { JwtPayload } from "@/common/interfaces/auth.interface"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express"
import { Strategy } from "passport-jwt"
import { AuthException } from "../exceptions/auth.exception"
import { TokenExtractorService } from "../utils/token-extractor"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private tokenExtractor: TokenExtractorService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request: Request) => {
      //     return request?.cookies?.accessToken
      //   },
      // ]),
      jwtFromRequest: (request: Request) =>
        this.tokenExtractor.fromHttpRequest(request),
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

// 이전에 만든 auth 코드 검증 받기
