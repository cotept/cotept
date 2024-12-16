// auth/utils/token-extractor.ts
import { AuthErrorMessage } from "@/common/constants/error.constants"
import { Injectable } from "@nestjs/common"
import { Request } from "express"
import { AuthException } from "../exceptions/auth.exception"
import { TokenExtractor } from "../interfaces/token-extractor.interface"

@Injectable()
export class TokenExtractorService implements TokenExtractor {
  fromHttpRequest(request: Request): string | null {
    try {
      // 쿠키에서 추출 시도
      const cookieToken = request?.cookies?.accessToken
      if (cookieToken) return cookieToken

      // Authorization 헤더에서 Bearer 토큰 추출 시도
      const authHeader = request.headers.authorization
      if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice(7)
      }

      // 커스텀 헤더에서 추출 시도
      const headerToken = request.headers["x-access-token"]
      if (headerToken) return headerToken as string

      return null
    } catch (error) {
      throw new AuthException({
        code: "TOKEN_INVALID",
        message: AuthErrorMessage.AUTH.TOKEN.INVALID,
      })
    }
  }

  // fromWebSocket(socket: Socket): string | null {
  //   try {
  //     // 소켓 handshake 쿼리에서 토큰 추출
  //     const wsToken = socket.handshake.query?.token
  //     if (typeof wsToken === "string") return wsToken

  //     // 소켓 handshake 헤더에서 토큰 추출
  //     const wsHeaderToken = socket.handshake.headers?.authorization
  //     if (wsHeaderToken?.startsWith("Bearer ")) {
  //       return wsHeaderToken.slice(7)
  //     }

  //     return null
  //   } catch (error) {
  //     throw new AuthException({
  //       code: "TOKEN_INVALID",
  //       message: AuthErrorMessage.AUTH.TOKEN.INVALID,
  //     })
  //   }
  // }

  // fromWebRTC(connection: RTCPeerConnection): string | null {
  //   try {
  //     // WebRTC 연결 설정에서 토큰 추출
  //     const rtcToken = connection.getConfiguration()?.iceServers?.[0]?.username
  //     if (rtcToken) return rtcToken

  //     return null
  //   } catch (error) {
  //     throw new AuthException({
  //       code: "TOKEN_INVALID",
  //       message: AuthErrorMessage.AUTH.TOKEN.INVALID,
  //     })
  //   }
  // }
}
