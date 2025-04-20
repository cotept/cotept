import { ErrorUtils } from "@/shared/utils/error.util"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { CookieOptions, Response } from "express"

/**
 * 쿠키 관리 어댑터
 * 안전한 쿠키 설정 및 관리를 위한 어댑터입니다.
 */
@Injectable()
export class CookieManagerAdapter {
  private readonly logger = new Logger(CookieManagerAdapter.name)

  // 리프레시 토큰 쿠키 이름
  private readonly REFRESH_TOKEN_COOKIE_NAME = "refresh_token"

  // 쿠키 설정 값
  private readonly isProduction: boolean
  private readonly domain: string

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get<string>("NODE_ENV") === "production"
    this.domain = configService.get<string>("COOKIE_DOMAIN", "")
  }

  /**
   * 리프레시 토큰 쿠키 설정
   * @param res Express Response 객체
   * @param token 리프레시 토큰
   * @param maxAge 쿠키 유효 시간(밀리초)
   */
  setRefreshTokenCookie(res: Response, token: string, maxAge: number): void {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: this.isProduction, // 프로덕션 환경에서만 secure 활성화
        sameSite: this.isProduction ? "strict" : "lax",
        maxAge,
        path: "/",
        domain: this.domain || undefined,
      }

      res.cookie(this.REFRESH_TOKEN_COOKIE_NAME, token, cookieOptions)
      this.logger.debug(`Refresh token cookie set with maxAge: ${maxAge}ms`)
    } catch (error) {
      this.logger.error(
        `Failed to set refresh token cookie: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * 리프레시 토큰 쿠키 삭제
   * @param res Express Response 객체
   */
  clearRefreshTokenCookie(res: Response): void {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: this.isProduction ? "strict" : "lax",
        path: "/",
        domain: this.domain || undefined,
      }

      res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, cookieOptions)
      this.logger.debug("Refresh token cookie cleared")
    } catch (error) {
      this.logger.error(
        `Failed to clear refresh token cookie: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }

  /**
   * CSRF 토큰 쿠키 설정
   * @param res Express Response 객체
   * @param token CSRF 토큰
   * @param maxAge 쿠키 유효 시간(밀리초)
   */
  setCsrfTokenCookie(res: Response, token: string, maxAge: number): void {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: false, // 클라이언트에서 접근 가능해야 함
        secure: this.isProduction,
        sameSite: this.isProduction ? "strict" : "lax",
        maxAge,
        path: "/",
        domain: this.domain || undefined,
      }

      res.cookie("csrf_token", token, cookieOptions)
      this.logger.debug(`CSRF token cookie set with maxAge: ${maxAge}ms`)
    } catch (error) {
      this.logger.error(
        `Failed to set CSRF token cookie: ${ErrorUtils.getErrorMessage(error)}`,
        ErrorUtils.getErrorStack(error),
      )
      throw error
    }
  }
}
